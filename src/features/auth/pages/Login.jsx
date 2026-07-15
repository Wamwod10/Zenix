import { Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD:src/features/auth/pages/Login.jsx
import { Button, Input, useNotification } from "../../../components/ui";
import { useGlassFollow } from "../../../shared/hooks/useGlassFollow";
import { getApiErrorMessage } from "../../../shared/services/api";
import { useLoginMutation } from "../authApi";
=======
// ✅ BACKEND INTEGRATION: redux + auth API
import { useDispatch } from "react-redux";
import { Button, Input, useNotification } from "../../../components/ui";
import { useGlassFollow } from "../../../shared/hooks/useGlassFollow";
import { setCredentials } from "../authSlice";
import { useLoginMutation } from "../authApi";
import { getApiError } from "../../../shared/services/api";
>>>>>>> d6b99a90462b6f5577d34dbe8eb51623ebd2e0a4:frontend/src/features/auth/pages/Login.jsx
import "./Login.scss";

export default function Login() {
  const { error } = useNotification();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const glassFollowRef = useGlassFollow();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // ✅ BACKEND INTEGRATION: POST /auth/login
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!email && !password) {
      error("Barcha majburiy maydonlarni to'ldiring.");
      return;
    }

    if (!email) {
      error("Email manzilini kiriting.");
      return;
    }

    if (!password) {
      error("Parolni kiriting.");
      return;
    }

<<<<<<< HEAD:src/features/auth/pages/Login.jsx
    try {
      await login({ email, password }).unwrap();
      navigate("/dashboard");
    } catch (requestError) {
      error(getApiErrorMessage(requestError, "Kirish bajarilmadi."));
=======
    // ✅ BACKEND INTEGRATION: backend'ga yuboramiz
    try {
      const data = await login({ email, password }).unwrap();

      // Tokenlar va user localStorage + redux'ga saqlanadi
      dispatch(setCredentials({ user: data.user, tokens: data.tokens }));
      navigate("/dashboard");
    } catch (err) {
      const apiError = getApiError(err);

      // Email tasdiqlanmagan -> verification sahifasiga yo'naltiramiz
      if (apiError.code === "EMAIL_NOT_VERIFIED") {
        sessionStorage.setItem("zenix_pending_email", email);
        error(apiError.message);
        navigate("/email-verification");
        return;
      }

      error(apiError.message);
>>>>>>> d6b99a90462b6f5577d34dbe8eb51623ebd2e0a4:frontend/src/features/auth/pages/Login.jsx
    }
  };

  return (
    <main className="login-page">
      <section className="login-page__panel">
        <div className="login-page__brand">
          <div className="login-page__logo">
            <img src="/1.png" alt="ZENIX" />
          </div>

          <div>
            <p>AI Business OS</p>
            <strong>ZENIX</strong>
          </div>
        </div>

        <div className="login-page__content">
          <span className="login-page__badge">Xush kelibsiz</span>

          <h1>Bugungi biznes uchun kechagi ERP yetarli emas.</h1>

          <p>
            ZENIX orqali savdo, ombor, mijozlar va moliyani bitta zamonaviy
            platformada boshqaring.
          </p>
        </div>

        <form className="login-page__form" noValidate onSubmit={handleSubmit}>
          <Input
            label="Email manzil"
            name="email"
            type="email"
            placeholder="emailingiz@kompaniya.uz"
            leftIcon={<Mail size={18} />}
          />

          <Input
            label="Parol"
            name="password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
          />

          <div className="login-page__meta">
            <label>
              <input type="checkbox" />
              <span>Meni eslab qol</span>
            </label>

            <a href="/forgot-password">Parolni unutdingizmi?</a>
          </div>

<<<<<<< HEAD:src/features/auth/pages/Login.jsx
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? "Tekshirilmoqda..." : "ZENIX ga kirish"}
=======
          {/* ✅ BACKEND INTEGRATION: so'rov paytida tugma bloklanadi */}
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? "Kirilmoqda..." : "ZENIX ga kirish"}
>>>>>>> d6b99a90462b6f5577d34dbe8eb51623ebd2e0a4:frontend/src/features/auth/pages/Login.jsx
          </Button>
        </form>

        <p className="login-page__footer">
          Hisobingiz yo‘qmi? <a href="/register">Hisob yaratish</a>
        </p>
      </section>

      <aside className="login-page__visual">
        <div className="login-page__follow" ref={glassFollowRef}>
          <div className="login-page__glass-card">
          <span>AI tahlili</span>
          <h2>Bugungi savdo kechagidan 18% yuqori.</h2>
          <p>
            Ombordagi tez aylanadigan mahsulotlar bo‘yicha aqlli tavsiyalar
            tayyor.
          </p>
          </div>
        </div>
      </aside>
    </main>
  );
}
