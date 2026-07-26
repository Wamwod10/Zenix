import { useEffect, useMemo, useState } from "react";
import { BadgePercent, CircleDollarSign, X } from "lucide-react";

import { calculateDiscountAmount } from "../utils/posCalculations";
import { formatMoney, normalizeMoney } from "../utils/posMoney";

import "./DiscountModal.scss";

const presets = [
  { label: "5%", type: "percentage", value: 5 },
  { label: "10%", type: "percentage", value: 10 },
  { label: "15%", type: "percentage", value: 15 },
];

const DiscountModal = ({
  open = false,
  subtotal = 0,
  currentDiscount = null,
  onClose,
  onApply,
  onRemove,
}) => {
  const [type, setType] = useState("percentage");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setType(currentDiscount?.type || "percentage");
    setValue(currentDiscount?.value ? String(currentDiscount.value) : "");
    setReason(currentDiscount?.reason || "");

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
  }, [currentDiscount, onClose, open]);

  const preview = useMemo(
    () =>
      calculateDiscountAmount({
        subtotal,
        discount: {
          type,
          value: normalizeMoney(value),
        },
      }),
    [subtotal, type, value],
  );

  const maxExceeded =
    type === "percentage"
      ? normalizeMoney(value) > 30
      : normalizeMoney(value) > normalizeMoney(subtotal);

  const canApply = normalizeMoney(value) > 0 && preview > 0 && !maxExceeded;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const handleApply = () => {
    if (!canApply) {
      return;
    }

    onApply?.({
      type,
      value: normalizeMoney(value),
      reason: reason.trim(),
      requiresApproval: type === "percentage" && normalizeMoney(value) > 15,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="pos-discount-modal"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className="pos-discount-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="discount-modal-title"
      >
        <div className="pos-discount-modal__header">
          <div>
            <span className="pos-discount-modal__eyebrow">
              <BadgePercent size={14} />
              Buyurtma chegirmasi
            </span>
            <h2 id="discount-modal-title">Chegirma qo'llash</h2>
            <p>Foiz yoki aniq summa kiriting. 15% dan yuqori chegirma rahbar tasdig'ini talab qiladi.</p>
          </div>

          <button
            className="pos-discount-modal__close"
            type="button"
            aria-label="Chegirma oynasini yopish"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="pos-discount-modal__presets">
          {presets.map((preset) => (
            <button
              type="button"
              key={preset.label}
              onClick={() => {
                setType(preset.type);
                setValue(String(preset.value));
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="pos-discount-modal__type">
          <button
            type="button"
            className={type === "percentage" ? "is-active" : ""}
            aria-pressed={type === "percentage"}
            onClick={() => setType("percentage")}
          >
            <BadgePercent size={16} />
            Foiz
          </button>
          <button
            type="button"
            className={type === "fixed" ? "is-active" : ""}
            aria-pressed={type === "fixed"}
            onClick={() => setType("fixed")}
          >
            <CircleDollarSign size={16} />
            Summa
          </button>
        </div>

        <label className="pos-discount-modal__field">
          <span>{type === "percentage" ? "Chegirma foizi" : "Chegirma summasi"}</span>
          <input
            type="number"
            min="0"
            max={type === "percentage" ? "30" : subtotal}
            step={type === "percentage" ? "1" : "1000"}
            value={value}
            autoFocus
            onChange={(event) => setValue(event.target.value)}
          />
        </label>

        <label className="pos-discount-modal__field">
          <span>Sabab</span>
          <textarea
            rows={3}
            value={reason}
            placeholder="Masalan: loyalty bonus yoki aksiyadagi mahsulot..."
            onChange={(event) => setReason(event.target.value)}
          />
        </label>

        <div className="pos-discount-modal__preview">
          <span>Oraliq summa: {formatMoney(subtotal)}</span>
          <strong>Chegirma: {formatMoney(preview)}</strong>
          {maxExceeded && <small>Chegirma limiti oshib ketdi.</small>}
        </div>

        <div className="pos-discount-modal__footer">
          <button
            className="pos-discount-modal__remove"
            type="button"
            onClick={onRemove}
          >
            Chegirmani olib tashlash
          </button>
          <button
            className="pos-discount-modal__apply"
            type="button"
            disabled={!canApply}
            onClick={handleApply}
          >
            <BadgePercent size={17} />
            Qo'llash
          </button>
        </div>
      </section>
    </div>
  );
};

export default DiscountModal;
