// Enterprise workflow: riskli amallar (holatni bloklash/nofaollashtirish,
// mahsulot bog'lanishini bekor qilish, hujjatni o'chirish) uchun YAGONA,
// qayta ishlatiladigan tasdiqlash dialogi — mavjud Modal/Button (Liquid
// Glass) ustida qurilgan, yangi dizayn tizimi kiritilmaydi.
//
// Xavfsizlik: standart fokus har doim "Bekor qilish" tugmasida — Enter
// tasodifan riskli amalni bajarib yubormaydi (professional ERP naqshi).
// Escape — Modal orqali allaqachon yopadi (bekor qilish bilan bir xil).

import { AlertTriangle, ShieldAlert } from "lucide-react";

import { Button } from "../../../../components/ui/Button/Button";
import { Modal } from "../../../../components/ui/Modal/Modal";

import "./SupplierConfirmDialog.scss";

const TONE_ICONS = {
  danger: ShieldAlert,
  warning: AlertTriangle,
};

const SupplierConfirmDialog = ({
  open,
  tone = "danger",
  title,
  description,
  confirmLabel = "Tasdiqlash",
  cancelLabel = "Bekor qilish",
  onConfirm,
  onClose,
}) => {
  const Icon = TONE_ICONS[tone] || ShieldAlert;

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      className="supplier-confirm-dialog"
      footer={
        <>
          <Button variant="ghost" autoFocus onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div
        className={`supplier-confirm-dialog__body supplier-confirm-dialog__body--${tone}`}
      >
        <span className="supplier-confirm-dialog__icon">
          <Icon size={20} />
        </span>
        <p>{description}</p>
      </div>
    </Modal>
  );
};

export default SupplierConfirmDialog;
