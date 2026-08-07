// Xaridlar moduli umumiy modal qobig'i (backdrop, Escape, scroll-lock).

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
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
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
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

  const handleDialogKeyDown = (event) => {
    if (event.key !== "Tab") return;

    const focusable = dialogRef.current?.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const nodes = Array.from(focusable || []);

    if (!nodes.length) {
      event.preventDefault();
      return;
    }

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const modal = (
    <div
      className="purchase-modal"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        ref={dialogRef}
        className={`purchase-modal__dialog purchase-modal__dialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="purchase-modal__header">
          <div>
            {eyebrow && <span className="purchase-modal__eyebrow">{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
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

  return typeof document === "undefined" ? modal : createPortal(modal, document.body);
};

export default PurchaseModal;
