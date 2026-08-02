import { useEffect, useMemo, useState } from "react";
import { Banknote, CheckCircle2, CreditCard, Layers3, Smartphone, UserCheck, X } from "lucide-react";

import { formatMoney } from "../utils/posMoney";

import "./PaymentPanel.scss";

const methods = [
  { id: "cash", label: "Naqd", icon: Banknote },
  { id: "card", label: "Karta", icon: CreditCard },
  { id: "digital", label: "Elektron", icon: Smartphone },
  { id: "split", label: "Split", icon: Layers3 },
  { id: "debt", label: "Qarz", icon: UserCheck },
];

const PaymentPanel = ({ open, total = 0, isOnline = true, customer, onClose, onComplete }) => {
  const [method, setMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState(total);
  const [split, setSplit] = useState({ cash: 0, card: 0, digital: 0 });
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!open) return;

    setMethod("cash");
    setCashReceived(total);
    setSplit({ cash: 0, card: 0, digital: 0 });
    setStatus("idle");
  }, [open, total]);

  const splitPaid = useMemo(
    () => Object.values(split).reduce((sum, value) => sum + Math.max(Number(value) || 0, 0), 0),
    [split],
  );

  const paidAmount = method === "cash" ? Number(cashReceived) || 0 : method === "split" ? splitPaid : total;
  const change = Math.max(paidAmount - total, 0);
  const remaining = Math.max(total - paidAmount, 0);

  const canComplete = useMemo(() => {
    if (total <= 0 || status !== "idle") return false;
    if ((method === "card" || method === "digital") && !isOnline) return false;
    if (method === "debt" && !customer) return false;
    if (method === "cash" || method === "split") return paidAmount >= total;
    return true;
  }, [customer, isOnline, method, paidAmount, status, total]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
      }

      if (event.key === "Enter" && canComplete) {
        event.preventDefault();
        handleComplete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  });

  const handleComplete = async () => {
    if (!canComplete) return;

    setStatus("processing");
    await new Promise((resolve) => {
      window.setTimeout(resolve, 420);
    });
    setStatus("success");
    await new Promise((resolve) => {
      window.setTimeout(resolve, 420);
    });

    onComplete?.({
      method,
      paidAmount,
      change,
      split: method === "split" ? split : null,
      completedAt: new Date().toISOString(),
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="payment-panel" role="presentation" onMouseDown={() => onClose?.()}>
      <section
        className="payment-panel__sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-panel-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="payment-panel__head">
          <div>
            <span>To'lanadigan summa</span>
            <h2 id="payment-panel-title">{formatMoney(total)}</h2>
          </div>
          <button type="button" aria-label="To'lov oynasini yopish" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="payment-panel__methods" role="list">
          {methods.map((item) => {
            const Icon = item.icon;
            const disabled =
              ((item.id === "card" || item.id === "digital") && !isOnline) ||
              (item.id === "debt" && !customer);

            return (
              <button
                type="button"
                className={method === item.id ? "is-active" : ""}
                disabled={disabled}
                key={item.id}
                title={disabled ? "Bu usul hozir mavjud emas" : item.label}
                onClick={() => setMethod(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="payment-panel__body">
          {method === "cash" && (
            <div className="payment-panel__cash">
              <label>
                <span>Qabul qilindi</span>
                <input
                  type="number"
                  min={total}
                  step="1000"
                  value={cashReceived}
                  autoFocus
                  onChange={(event) => setCashReceived(event.target.value)}
                />
              </label>
              <div className="payment-panel__quick">
                {[total, Math.ceil(total / 10000) * 10000, total + 50000, total + 100000].map((amount) => (
                  <button type="button" key={amount} onClick={() => setCashReceived(amount)}>
                    {formatMoney(amount)}
                  </button>
                ))}
              </div>
              <div className="payment-panel__change">
                <span>Qaytim</span>
                <strong>{formatMoney(change)}</strong>
              </div>
            </div>
          )}

          {(method === "card" || method === "digital") && (
            <div className="payment-panel__terminal">
              {method === "card" ? <CreditCard size={32} /> : <Smartphone size={32} />}
              <strong>{method === "card" ? "Terminal kutmoqda" : "QR to'lov tayyor"}</strong>
              <span>{isOnline ? "Tasdiqlashdan keyin savdo yopiladi." : "Offline rejimda bu usul ishlamaydi."}</span>
            </div>
          )}

          {method === "split" && (
            <div className="payment-panel__split">
              {["cash", "card", "digital"].map((key) => (
                <label key={key}>
                  <span>{key === "cash" ? "Naqd" : key === "card" ? "Karta" : "Elektron"}</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={split[key]}
                    onChange={(event) => setSplit((value) => ({ ...value, [key]: event.target.value }))}
                  />
                </label>
              ))}
              <div className="payment-panel__remaining">
                <span>Qolgan summa</span>
                <strong>{formatMoney(remaining)}</strong>
              </div>
            </div>
          )}

          {method === "debt" && (
            <div className="payment-panel__terminal">
              <UserCheck size={32} />
              <strong>{customer?.name}</strong>
              <span>Mijoz tanlanganda qarzga yozish mumkin.</span>
            </div>
          )}
        </div>

        <div className="payment-panel__footer">
          <button type="button" onClick={onClose}>
            Bekor qilish
          </button>
          <button type="button" disabled={!canComplete} onClick={handleComplete}>
            {status === "success" ? <CheckCircle2 size={20} /> : <Banknote size={20} />}
            <span>{status === "processing" ? "Qayta ishlanmoqda..." : "Tasdiqlash"}</span>
          </button>
        </div>

        {status === "success" && (
          <div className="payment-panel__success" role="status">
            <CheckCircle2 size={34} />
            <strong>To'lov qabul qilindi</strong>
          </div>
        )}
      </section>
    </div>
  );
};

export default PaymentPanel;
