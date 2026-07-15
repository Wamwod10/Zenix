import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  HandCoins,
  Layers3,
  Smartphone,
  Wallet,
  WalletCards,
  X,
} from "lucide-react";

import PaymentMethodCard from "../PaymentMethodCard/PaymentMethodCard";
import SplitPayment from "../SplitPayment/SplitPayment";
import { validateSplitPayment } from "../utils/posCalculations";
import { formatMoney } from "../utils/posMoney";

import "./PaymentModal.scss";

const paymentMethods = [
  {
    id: "cash",
    label: "Naqd",
    description: "Naqd pul orqali to'lov",
    icon: Banknote,
  },
  {
    id: "card",
    label: "Bank kartasi",
    description: "Terminal orqali karta to'lovi",
    icon: CreditCard,
  },
  {
    id: "digital",
    label: "Click / Payme",
    description: "Mobil provider yoki QR orqali",
    icon: Smartphone,
  },
  {
    id: "split",
    label: "Split payment",
    description: "To'lovni bir nechta usulga bo'lish",
    icon: Layers3,
  },
  {
    id: "debt",
    label: "Qarzga yozish",
    description: "Customer debt ledger uchun",
    icon: HandCoins,
  },
  {
    id: "advance",
    label: "Avans",
    description: "Oldindan to'lov sifatida",
    icon: Wallet,
  },
];

const PaymentModal = ({
  open = false,
  total = 0,
  isOnline = true,
  customer = null,
  onClose,
  onComplete,
}) => {
  const [activeMethod, setActiveMethod] = useState("cash");
  const [digitalProvider, setDigitalProvider] = useState("click");
  const [cashReceived, setCashReceived] = useState(total);
  const [paymentState, setPaymentState] = useState("idle");
  const [splitValues, setSplitValues] = useState({
    cash: 0,
    card: 0,
    digital: 0,
  });

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setActiveMethod("cash");
    setPaymentState("idle");
    setDigitalProvider("click");
    setCashReceived(total);
    setSplitValues({
      cash: 0,
      card: 0,
      digital: 0,
    });

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, total, onClose]);

  const splitValidation = useMemo(
    () => validateSplitPayment(splitValues, total),
    [splitValues, total],
  );

  const changeAmount =
    activeMethod === "cash"
      ? Math.max(Number(cashReceived) - Number(total), 0)
      : activeMethod === "split"
        ? splitValidation.overpaid
        : 0;

  const canComplete = useMemo(() => {
    if (Number(total) <= 0) {
      return false;
    }

    if (activeMethod === "cash") {
      return Number(cashReceived) >= Number(total);
    }

    if (activeMethod === "split") {
      return splitValidation.isValid;
    }

    if (activeMethod === "card" || activeMethod === "digital") {
      return isOnline;
    }

    if (activeMethod === "debt") {
      return Boolean(customer);
    }

    return true;
  }, [activeMethod, cashReceived, customer, isOnline, splitValidation.isValid, total]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const handleComplete = async () => {
    if (!canComplete) {
      return;
    }

    setPaymentState("processing");

    await new Promise((resolve) => {
      window.setTimeout(resolve, 360);
    });

    setPaymentState("success");

    await new Promise((resolve) => {
      window.setTimeout(resolve, 520);
    });

    await onComplete?.({
      method: activeMethod,
      total: Number(total),
      paidAmount:
        activeMethod === "cash"
          ? Number(cashReceived)
          : activeMethod === "split"
            ? splitValidation.paidAmount
            : activeMethod === "debt"
              ? 0
              : Number(total),
      change: changeAmount,
      split: activeMethod === "split" ? splitValues : null,
      provider: activeMethod === "digital" ? digitalProvider : null,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="pos-payment-modal"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className="pos-payment-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pos-payment-title"
      >
        <div className="pos-payment-modal__header">
          <div>
            <span className="pos-payment-modal__eyebrow">
              <WalletCards size={14} />
              Secure checkout
            </span>

            <h2 id="pos-payment-title">To'lovni yakunlash</h2>

            <p>To'lov usulini tanlang va savdoni tasdiqlang.</p>
          </div>

          <button
            className="pos-payment-modal__close"
            type="button"
            aria-label="To'lov oynasini yopish"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="pos-payment-modal__total">
          <span>To'lanadigan summa</span>
          <strong>{formatMoney(total)}</strong>
        </div>

        <div className="pos-payment-modal__body">
          <div className="pos-payment-modal__methods">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                method={method}
                active={activeMethod === method.id}
                disabled={
                  ((method.id === "card" || method.id === "digital") && !isOnline) ||
                  (method.id === "debt" && !customer)
                }
                key={method.id}
                onSelect={setActiveMethod}
              />
            ))}
          </div>

          <div className="pos-payment-modal__details">
            {activeMethod === "cash" && (
              <div className="pos-payment-modal__cash">
                <div className="pos-payment-modal__section-head">
                  <div>
                    <span>Cash payment</span>
                    <strong>Qabul qilingan naqd pul</strong>
                  </div>

                  <Banknote size={20} />
                </div>

                <label className="pos-payment-modal__cash-input">
                  <input
                    type="number"
                    min={total}
                    step="1000"
                    value={cashReceived}
                    autoFocus
                    onChange={(event) => setCashReceived(event.target.value)}
                  />
                  <span>so'm</span>
                </label>

                <div className="pos-payment-modal__quick-cash">
                  {[total, total + 10000, total + 50000].map((amount) => (
                    <button
                      type="button"
                      key={amount}
                      onClick={() => setCashReceived(amount)}
                    >
                      {formatMoney(amount)}
                    </button>
                  ))}
                </div>

                <div className="pos-payment-modal__change">
                  <span>Qaytim</span>
                  <strong>{formatMoney(changeAmount)}</strong>
                </div>
              </div>
            )}

            {activeMethod === "card" && (
              <div className="pos-payment-modal__terminal">
                <CreditCard size={30} />
                <strong>Terminal tayyor</strong>
                <span>Kartani terminalga kiriting yoki yaqinlashtiring.</span>
                <small>Terminal integratsiyasi backend va hardware service orqali ulanadi.</small>
              </div>
            )}

            {activeMethod === "digital" && (
              <div className="pos-payment-modal__terminal">
                <Smartphone size={30} />
                <strong>Click / Payme mock</strong>
                <span>QR yoki mobil payment provider tanlanadi.</span>
                <div className="pos-payment-modal__providers">
                  {["click", "payme"].map((provider) => (
                    <button
                      type="button"
                      key={provider}
                      className={digitalProvider === provider ? "is-active" : ""}
                      aria-pressed={digitalProvider === provider}
                      onClick={() => setDigitalProvider(provider)}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
                <small>Click, Payme va boshqa integratsiyalar keyingi bosqichda ulanadi.</small>
              </div>
            )}

            {activeMethod === "split" && (
              <SplitPayment
                total={total}
                values={splitValues}
                onChange={setSplitValues}
              />
            )}

            {activeMethod === "debt" && (
              <div className="pos-payment-modal__terminal">
                <HandCoins size={30} />
                <strong>Customer debt</strong>
                <span>{customer?.name} hisobiga qarz sifatida yoziladi.</span>
                <small>Debt ledger backend ulanmaguncha sale object ichida belgilanadi.</small>
              </div>
            )}

            {activeMethod === "advance" && (
              <div className="pos-payment-modal__terminal">
                <Wallet size={30} />
                <strong>Advance payment</strong>
                <span>To'lov avans sifatida qayd qilinadi.</span>
                <small>Avans balans backend finance module bilan integratsiyaga tayyor.</small>
              </div>
            )}
          </div>
        </div>

        <div className="pos-payment-modal__footer">
          <button
            className="pos-payment-modal__cancel"
            type="button"
            onClick={onClose}
          >
            Bekor qilish
          </button>

          <button
            className="pos-payment-modal__complete"
            type="button"
            disabled={!canComplete || paymentState !== "idle"}
            onClick={handleComplete}
          >
            <WalletCards size={18} />

            <span>
              <strong>
                {paymentState === "processing"
                  ? "Processing..."
                  : paymentState === "success"
                    ? "To'lov qabul qilindi"
                    : "To'lovni tasdiqlash"}
              </strong>
              <small>{formatMoney(total)}</small>
            </span>
          </button>
        </div>

        {paymentState === "success" && (
          <div className="pos-payment-modal__success" role="status">
            <span>
              <CheckCircle2 size={34} />
            </span>
            <strong>Payment successful</strong>
            <small>Receipt preview tayyorlanmoqda</small>
          </div>
        )}
      </section>
    </div>
  );
};

export default PaymentModal;
