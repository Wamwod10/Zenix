// Extracted from SupplierProfile.jsx: "Hujjatlar" bo'limi — mavjud
// PurchaseAttachmentManager (Purchases moduli) qayta ishlatiladi.
//
// Hujjatni o'chirishni tasdiqlash so'rovi ilgari SupplierProfile.jsx'ning
// umumiy state'ida edi — endi shu yerda, faqat shu bo'lim ishlatadigan
// joyda.

import { useState } from "react";

import { Card } from "../../../../../components/ui/Card/Card";
import { useNotification } from "../../../../../components/ui/Notification/NotificationContext";
import PurchaseAttachmentManager from "../../../../purchases/components/PurchaseAttachmentManager/PurchaseAttachmentManager";
import SupplierConfirmDialog from "../../SupplierConfirmDialog/SupplierConfirmDialog";

const SupplierDocumentsTab = ({
  supplier,
  onAddDocument,
  onRemoveDocument,
  onSetDocumentExpiry,
}) => {
  const notify = useNotification();
  const [documentToRemove, setDocumentToRemove] = useState(null);

  const requestRemoveDocument = (file) => setDocumentToRemove(file);

  const confirmRemoveDocument = () => {
    if (!documentToRemove) return;

    onRemoveDocument?.(documentToRemove);
    notify.success(`"${documentToRemove.name}" hujjati o'chirildi.`);
    setDocumentToRemove(null);
  };

  return (
    <Card
      className="supplier-profile__card"
      role="tabpanel"
      id="supplier-tabpanel-documents"
      aria-labelledby="supplier-tab-documents"
    >
      <h3>Hujjatlar</h3>

      <PurchaseAttachmentManager
        title="Yetkazib beruvchi hujjatlari"
        emptyTitle="Hujjat biriktirilmagan"
        emptyText="Shartnoma, litsenziya yoki sertifikat qo'shing."
        attachments={supplier.documents || []}
        showExpiry
        onAdd={(files) => {
          const results = files.map((file) => onAddDocument?.(file));
          const failed = results.filter((result) => result?.ok === false);

          if (failed.length) {
            notify.error(failed[0].error || `${failed.length} ta hujjat biriktirilmadi.`);
          }

          if (failed.length < files.length) {
            notify.success(
              files.length - failed.length > 1
                ? `${files.length - failed.length} ta hujjat biriktirildi.`
                : "Hujjat biriktirildi.",
            );
          }
        }}
        onRemove={requestRemoveDocument}
        onSetExpiry={(file, expiryDate) => {
          const result = onSetDocumentExpiry?.(file, expiryDate);

          if (result?.ok === false) notify.error(result.error);
          else if (result?.changed) notify.success("Hujjat muddati yangilandi.");
        }}
      />

      <SupplierConfirmDialog
        open={!!documentToRemove}
        tone="warning"
        title="Hujjatni o'chirish"
        description={`"${documentToRemove?.name || "Hujjat"}" butunlay o'chiriladi. Bu amalni keyin qaytarib bo'lmaydi.`}
        confirmLabel="Ha, o'chirish"
        onConfirm={confirmRemoveDocument}
        onClose={() => setDocumentToRemove(null)}
      />
    </Card>
  );
};

export default SupplierDocumentsTab;
