// Sabab bilan tasdiqlanadigan amallar: rad etish (PDF 5), bekor qilish (PDF 2),
// yopish (PDF 22), qaytarishni rad etish (PDF 37). Sabab majburiy.

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

import PurchaseModal from "../../components/PurchaseModal/PurchaseModal";

const ConfirmReasonModal = ({
  open,
  title = "Amalni tasdiqlang",
  description = "",
  confirmLabel = "Tasdiqlash",
  reasonRequired = true,
  tone = "danger",
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const canConfirm = !reasonRequired || reason.trim().length >= 3;

  return (
    <PurchaseModal
      open={open}
      size="sm"
      eyebrow={
        <>
          <ShieldAlert size={14} />
          Nazorat amali
        </>
      }
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <button className="purchase-btn purchase-btn--ghost" type="button" onClick={onClose}>
            Ortga
          </button>
          <button
            className={`purchase-btn purchase-btn--${tone === "danger" ? "danger" : "primary"}`}
            type="button"
            disabled={!canConfirm}
            onClick={() => onConfirm?.(reason.trim())}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <label className="purchase-field">
        <span>Sabab {reasonRequired ? "(majburiy)" : "(ixtiyoriy)"}</span>
        <textarea
          rows={3}
          value={reason}
          autoFocus
          placeholder="Sababni yozing..."
          onChange={(event) => setReason(event.target.value)}
        />
        {reasonRequired && !canConfirm && (
          <small>Kamida 3 ta belgi kiriting — audit uchun sabab majburiy.</small>
        )}
      </label>
    </PurchaseModal>
  );
};

export default ConfirmReasonModal;
