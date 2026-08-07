import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import "./ConfirmDialog.scss";

const ConfirmDialog = ({
  open,
  title,
  description,
  children,
  confirmLabel = "Tasdiqlash",
  onConfirm,
  onClose,
  confirmDisabled = false,
  panelClassName = "",
}) => {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.classList.add("finance-dialog-open");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("finance-dialog-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  const dialog = (
    <div className="finance-dialog" role="dialog" aria-modal="true" aria-labelledby="finance-dialog-title">
      <button
        className="finance-dialog__backdrop"
        type="button"
        aria-label="Modalni yopish"
        onClick={onClose}
      />
      <section className={["finance-dialog__panel", panelClassName].filter(Boolean).join(" ")}>
        <header>
          <div>
            <h2 id="finance-dialog-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" aria-label="Modalni yopish" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="finance-dialog__body">{children}</div>
        <footer>
          <button type="button" onClick={onClose}>
            Bekor qilish
          </button>
          <button type="button" className="is-primary" disabled={confirmDisabled} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </footer>
      </section>
    </div>
  );

  return typeof document === "undefined" ? dialog : createPortal(dialog, document.body);
};

export default ConfirmDialog;
