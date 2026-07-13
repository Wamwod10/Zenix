import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MailCheck, RotateCcw } from "lucide-react";
import { Button, useNotification } from "../../../components/ui";
// ✅ BACKEND INTEGRATION: redux + auth API
import { useDispatch } from "react-redux";
import { setCredentials } from "../authSlice";
import { useVerifyEmailMutation, useResendCodeMutation } from "../authApi";
import { getApiError } from "../../../shared/services/api";
import "./EmailVerification.scss";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function createEmptyOtp() {
  return Array(OTP_LENGTH).fill("");
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function getDigits(value) {
  return value.replace(/\D/g, "");
}

export default function EmailVerification() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(createEmptyOtp);
  const [resendTime, setResendTime] = useState(RESEND_SECONDS);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { error, success } = useNotification();
  const dispatch = useDispatch();
  // ✅ BACKEND INTEGRATION: POST /auth/verify-email va /auth/resend-code
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendCode, { isLoading: isResending }] = useResendCodeMutation();

  const focusInput = useCallback((index) => {
    inputRefs.current[index]?.focus();
  }, []);

  const resetOtp = useCallback(() => {
    setOtp(createEmptyOtp());
    requestAnimationFrame(() => focusInput(0));
  }, [focusInput]);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("zenix_pending_email");

    if (!pendingEmail) {
      navigate("/register", { replace: true });
      return;
    }

    setEmail(pendingEmail);
    requestAnimationFrame(() => focusInput(0));
  }, [focusInput, navigate]);

  useEffect(() => {
    if (resendTime <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setResendTime((currentTime) => Math.max(currentTime - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [resendTime]);

  const applyDigits = (digits, startIndex) => {
    if (!digits) {
      return;
    }

    setOtp((currentOtp) => {
      const nextOtp = [...currentOtp];
      const targetStartIndex = digits.length === OTP_LENGTH ? 0 : startIndex;

      digits
        .slice(0, OTP_LENGTH - targetStartIndex)
        .split("")
        .forEach((digit, digitIndex) => {
          nextOtp[targetStartIndex + digitIndex] = digit;
        });

      return nextOtp;
    });

    const targetStartIndex = digits.length === OTP_LENGTH ? 0 : startIndex;
    const nextIndex = Math.min(targetStartIndex + digits.length, OTP_LENGTH - 1);
    requestAnimationFrame(() => focusInput(nextIndex));
  };

  const handleOtpChange = (event, index) => {
    const digits = getDigits(event.target.value);

    if (!digits) {
      setOtp((currentOtp) => {
        const nextOtp = [...currentOtp];
        nextOtp[index] = "";
        return nextOtp;
      });
      return;
    }

    applyDigits(digits, index);
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key !== "Backspace") {
      return;
    }

    if (otp[index]) {
      event.preventDefault();
      setOtp((currentOtp) => {
        const nextOtp = [...currentOtp];
        nextOtp[index] = "";
        return nextOtp;
      });
      return;
    }

    if (index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }
  };

  const handleOtpPaste = (event, index) => {
    event.preventDefault();
    applyDigits(getDigits(event.clipboardData.getData("text")), index);
  };

  // ✅ BACKEND INTEGRATION: kodni qayta yuborish (backend'da ham 60s cooldown bor)
  const handleResend = async () => {
    if (resendTime > 0 || isResending) {
      return;
    }

    try {
      const data = await resendCode({ email }).unwrap();

      // DEV rejimda backend yangi OTP kodni devCode sifatida qaytaradi
      if (data.devCode) {
        success(`[DEV] Yangi kod: ${data.devCode}`);
      } else {
        success("Yangi tasdiqlash kodi yuborildi.");
      }

      setResendTime(RESEND_SECONDS);
      resetOtp();
    } catch (err) {
      error(getApiError(err).message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const firstEmptyIndex = otp.findIndex((digit) => !digit);

    if (firstEmptyIndex !== -1) {
      error("6 xonali tasdiqlash kodini kiriting.");
      focusInput(firstEmptyIndex);
      return;
    }

    const code = otp.join("");

    // ✅ BACKEND INTEGRATION: OTP tekshirish -> akkaunt faollashadi, tokenlar keladi
    try {
      const data = await verifyEmail({ email, code }).unwrap();

      // Tokenlar va user localStorage + redux'ga saqlanadi
      dispatch(setCredentials({ user: data.user, tokens: data.tokens }));

      sessionStorage.removeItem("zenix_pending_email");
      success("Email tasdiqlandi!");
      navigate("/business-type");
    } catch (err) {
      const apiError = getApiError(err);

      // Allaqachon tasdiqlangan bo'lsa -> login sahifasiga
      if (apiError.code === "ALREADY_VERIFIED") {
        error(apiError.message);
        navigate("/login");
        return;
      }

      error(apiError.message);
      resetOtp();
    }
  };

  if (!email) {
    return null;
  }

  return (
    <main className="verify-page">
      <section className="verify-page__card">
        <div className="verify-page__brand">
          <div className="verify-page__logo">
            <img src="/1.png" alt="ZENIX" />
          </div>

          <div>
            <p>AI Business OS</p>
            <strong>ZENIX</strong>
          </div>
        </div>

        <div className="verify-page__icon">
          <MailCheck size={28} />
        </div>

        <span className="verify-page__badge">Email verification</span>

        <h1>Emailingizni tasdiqlang.</h1>

        <p className="verify-page__description">
          Biz sizning email manzilingizga 6 xonali tasdiqlash kodini yubordik.
          Davom etish uchun kodni kiriting.
        </p>

        <div className="verify-page__email">
          Code sent to <strong>{email}</strong>
        </div>

        <form className="verify-page__form" noValidate onSubmit={handleSubmit}>
          <div className="verify-page__otp" aria-label="Verification code">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                value={digit}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength="1"
                aria-label={`Digit ${index + 1}`}
                onChange={(event) => handleOtpChange(event, index)}
                onKeyDown={(event) => handleOtpKeyDown(event, index)}
                onPaste={(event) => handleOtpPaste(event, index)}
              />
            ))}
          </div>

          {/* ✅ BACKEND INTEGRATION: tekshirish paytida tugma bloklanadi */}
          <Button
            type="submit"
            fullWidth
            disabled={isVerifying}
            rightIcon={<ArrowRight size={18} />}
          >
            {isVerifying ? "Tekshirilmoqda..." : "Verify Email"}
          </Button>
        </form>

        <button
          className="verify-page__resend"
          type="button"
          disabled={resendTime > 0}
          onClick={handleResend}
        >
          <RotateCcw size={16} />
          {resendTime > 0
            ? `Resend code in ${formatTimer(resendTime)}`
            : "Resend code"}
        </button>

        <p className="verify-page__footer">
          Wrong email? <a href="/register">Go back</a>
        </p>
      </section>
    </main>
  );
}
