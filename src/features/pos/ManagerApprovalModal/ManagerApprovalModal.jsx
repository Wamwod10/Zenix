import { useEffect, useState } from "react";
import { ShieldCheck, X } from "lucide-react";

import "./ManagerApprovalModal.scss";

const ManagerApprovalModal = ({ open = false, request = null, onClose, onApprove }) => {
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setCode("");
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

  if (!open || !request) {
    return null;
  }

  return (
    <div className="pos-manager-approval" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section
        className="pos-manager-approval__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manager-approval-title"
      >
        <div className="pos-manager-approval__header">
          <div>
            <span>
              <ShieldCheck size={14} />
              Manager approval
            </span>
            <h2 id="manager-approval-title">{request.title}</h2>
            <p>{request.message}</p>
          </div>
          <button type="button" aria-label="Approval oynasini yopish" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <label className="pos-manager-approval__field">
          <span>Manager PIN</span>
          <input
            type="password"
            inputMode="numeric"
            value={code}
            placeholder="1234"
            autoFocus
            onChange={(event) => setCode(event.target.value)}
          />
        </label>

        <div className="pos-manager-approval__footer">
          <button type="button" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            type="button"
            disabled={code.length < 4}
            onClick={() => onApprove?.(request)}
          >
            Tasdiqlash
          </button>
        </div>
      </section>
    </div>
  );
};

export default ManagerApprovalModal;
