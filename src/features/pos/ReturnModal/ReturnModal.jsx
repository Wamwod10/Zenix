import { useEffect, useMemo, useState } from "react";
import { RotateCcw, X } from "lucide-react";

import { calculateLineTotal, formatMoney } from "../utils/posMoney";

import "./ReturnModal.scss";

const reasons = ["Mijoz qaytardi", "Noto'g'ri mahsulot", "Nosoz mahsulot", "Narx xatosi"];

const ReturnModal = ({ open = false, sale = null, onClose, onConfirm }) => {
  const [mode, setMode] = useState("full");
  const [reason, setReason] = useState(reasons[0]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (!open || !sale) {
      return undefined;
    }

    setMode("full");
    setReason(reasons[0]);
    setQuantities(
      Object.fromEntries(sale.items.map((item) => [item.id, item.quantity])),
    );

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
  }, [onClose, open, sale]);

  const selectedItems = useMemo(() => {
    if (!sale) {
      return [];
    }

    return sale.items
      .map((item) => ({
        ...item,
        returnQuantity:
          mode === "full"
            ? Number(item.quantity || 0)
            : Math.min(Number(quantities[item.id] || 0), Number(item.quantity || 0)),
      }))
      .filter((item) => item.returnQuantity > 0);
  }, [mode, quantities, sale]);

  const refundTotal = selectedItems.reduce(
    (total, item) => total + calculateLineTotal(item.price, item.returnQuantity),
    0,
  );

  if (!open || !sale) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className="pos-return-modal" role="presentation" onMouseDown={handleBackdropClick}>
      <section
        className="pos-return-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-modal-title"
      >
        <div className="pos-return-modal__header">
          <div>
            <span className="pos-return-modal__eyebrow">
              <RotateCcw size={14} />
              Return
            </span>
            <h2 id="return-modal-title">{sale.receiptNumber}</h2>
            <p>{sale.customer?.name || "Walk-in customer"}</p>
          </div>
          <button type="button" aria-label="Return oynasini yopish" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="pos-return-modal__mode">
          <button
            type="button"
            className={mode === "full" ? "is-active" : ""}
            aria-pressed={mode === "full"}
            onClick={() => setMode("full")}
          >
            Full return
          </button>
          <button
            type="button"
            className={mode === "partial" ? "is-active" : ""}
            aria-pressed={mode === "partial"}
            onClick={() => setMode("partial")}
          >
            Partial return
          </button>
        </div>

        <label className="pos-return-modal__reason">
          <span>Reason</span>
          <select value={reason} onChange={(event) => setReason(event.target.value)}>
            {reasons.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="pos-return-modal__items">
          {sale.items.map((item) => (
            <article className="pos-return-modal__item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>{item.quantity} x {formatMoney(item.price)}</span>
              </div>
              {mode === "partial" ? (
                <input
                  type="number"
                  min="0"
                  max={item.quantity}
                  step={item.weight ? "0.001" : "1"}
                  value={quantities[item.id] || 0}
                  onChange={(event) =>
                    setQuantities((current) => ({
                      ...current,
                      [item.id]: event.target.value,
                    }))
                  }
                />
              ) : (
                <b>{formatMoney(calculateLineTotal(item.price, item.quantity))}</b>
              )}
            </article>
          ))}
        </div>

        <div className="pos-return-modal__summary">
          <span>Refund</span>
          <strong>{formatMoney(refundTotal)}</strong>
        </div>

        <div className="pos-return-modal__footer">
          <button type="button" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            type="button"
            disabled={!selectedItems.length}
            onClick={() =>
              onConfirm?.({
                saleId: sale.id,
                receiptNumber: sale.receiptNumber,
                type: mode,
                reason,
                items: selectedItems,
                refundTotal,
              })
            }
          >
            Return yaratish
          </button>
        </div>
      </section>
    </div>
  );
};

export default ReturnModal;
