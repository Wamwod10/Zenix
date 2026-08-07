import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import "./HRDialog.scss";

const HRDialog = ({ open, title, children, onClose }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const dialog = (
    <div className="hr-dialog" role="presentation" onMouseDown={onClose}>
      <section
        className="hr-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hr-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <h2 id="hr-dialog-title">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Dialogni yopish">
            <X size={17} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );

  return typeof document === "undefined" ? dialog : createPortal(dialog, document.body);
};

export default HRDialog;
