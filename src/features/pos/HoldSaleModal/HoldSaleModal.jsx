import { useEffect, useState } from "react";
import { PauseCircle, X } from "lucide-react";

import { formatMoney } from "../utils/posMoney";

import "./HoldSaleModal.scss";

const HoldSaleModal = ({
  open = false,
  items = [],
  total = 0,
  customer = null,
  onClose,
  onConfirm,
}) => {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setNote("");

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
  }, [open, onClose]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!items.length) {
      return;
    }

    onConfirm?.({
      note: note.trim(),
      customer,
      items,
      total,
    });
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="pos-hold-modal"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <form
        className="pos-hold-modal__dialog"
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hold-sale-title"
      >
        <div className="pos-hold-modal__header">
          <div className="pos-hold-modal__title">
            <span className="pos-hold-modal__icon">
              <PauseCircle size={20} />
            </span>

            <div>
              <span>Vaqtinchalik saqlash</span>
              <h2 id="hold-sale-title">Savdoni vaqtincha saqlash</h2>
            </div>
          </div>

          <button
            className="pos-hold-modal__close"
            type="button"
            aria-label="Oynani yopish"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="pos-hold-modal__summary">
          <div>
            <span>Mahsulotlar</span>
            <strong>{items.length} ta</strong>
          </div>

          <div>
            <span>Mijoz</span>
            <strong>{customer?.name || "Nomsiz mijoz"}</strong>
          </div>

          <div>
            <span>Jami</span>
            <strong>{formatMoney(total)}</strong>
          </div>
        </div>

        <label className="pos-hold-modal__field">
          <span>Buyurtma izohi</span>

          <textarea
            value={note}
            rows={4}
            placeholder="Masalan: Mijoz karta olib keladi..."
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        <div className="pos-hold-modal__footer">
          <button
            className="pos-hold-modal__cancel"
            type="button"
            onClick={onClose}
          >
            Bekor qilish
          </button>

          <button
            className="pos-hold-modal__confirm"
            type="submit"
            disabled={!items.length}
          >
            <PauseCircle size={17} />
            Savdoni saqlash
          </button>
        </div>
      </form>
    </div>
  );
};

export default HoldSaleModal;
