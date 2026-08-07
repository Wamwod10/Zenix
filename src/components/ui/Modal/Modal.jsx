import { X } from "lucide-react";
import { createPortal } from "react-dom";
import "./Modal.scss";

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  className = "",
}) {
  if (!open) return null;

  const modal = (
    <div className="ui-modal" role="dialog" aria-modal="true">
      <button
        className="ui-modal__backdrop"
        type="button"
        aria-label="Close modal"
        onClick={onClose}
      />

      <section className={`ui-modal__panel ${className}`}>
        <div className="ui-modal__header">
          <div>
            {title && <h2 className="ui-modal__title">{title}</h2>}
            {description && <p className="ui-modal__description">{description}</p>}
          </div>

          <button className="ui-modal__close" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="ui-modal__body">{children}</div>

        {footer && <div className="ui-modal__footer">{footer}</div>}
      </section>
    </div>
  );

  return typeof document === "undefined" ? modal : createPortal(modal, document.body);
}
