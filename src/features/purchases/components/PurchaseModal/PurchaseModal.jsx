// Xaridlar moduli umumiy modal qobig'i (backdrop, Escape, scroll-lock).

import { useEffect } from "react";
import { X } from "lucide-react";

import "./PurchaseModal.scss";

const PurchaseModal = ({
  open = false,
  eyebrow,
  title,
  description,
  size = "md",
  onClose,
  children,
  footer,
}) => {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

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
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="purchase-modal"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className={`purchase-modal__dialog purchase-modal__dialog--${size}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="purchase-modal__header">
          <div>
            {eyebrow && <span className="purchase-modal__eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>

          <button
            className="purchase-modal__close"
            type="button"
            aria-label="Oynani yopish"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="purchase-modal__body">{children}</div>

        {footer && <div className="purchase-modal__footer">{footer}</div>}
      </section>
    </div>
  );
};

export default PurchaseModal;
