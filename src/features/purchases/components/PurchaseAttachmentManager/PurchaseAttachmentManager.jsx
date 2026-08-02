import { useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  Download,
  FileText,
  FileUp,
  Image as ImageIcon,
  Paperclip,
  Trash2,
} from "lucide-react";

import { formatPurchaseDate } from "../../utils/purchaseMoney";
import { createEntityId } from "../../utils/purchaseIds";
import {
  ATTACHMENT_ALLOWED_EXTENSIONS,
  ATTACHMENT_MAX_SIZE,
} from "../../utils/attachmentValidation";

import "./PurchaseAttachmentManager.scss";

const formatFileSize = (size = 0) => {
  if (!size) return "0 KB";

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(Math.round(size / 1024), 1)} KB`;
};

const getExtension = (name = "") =>
  name.includes(".") ? name.split(".").pop().toLowerCase() : "";

const getFileTypeLabel = (file = {}) => {
  const extension = (file.extension || getExtension(file.name)).toUpperCase();

  if (file.mimeType?.startsWith("image/")) return extension || "IMAGE";
  if (file.mimeType === "application/pdf" || extension === "PDF") return "PDF";

  return extension || file.type?.toUpperCase() || "FILE";
};

const isImage = (file = {}) =>
  file.mimeType?.startsWith("image/") ||
  ["png", "jpg", "jpeg", "webp", "gif"].includes(
    file.extension || getExtension(file.name),
  );

const isPdf = (file = {}) =>
  file.mimeType === "application/pdf" ||
  (file.extension || getExtension(file.name)) === "pdf" ||
  file.type === "pdf";

const fileSignature = (file = {}) =>
  `${(file.name || "").trim().toLowerCase()}::${file.size || 0}::${
    file.mimeType || file.type || getExtension(file.name)
  }`;

const buildAttachment = (file) => {
  const extension = getExtension(file.name);
  const objectUrl = URL.createObjectURL(file);

  return {
    id: createEntityId("att"),
    name: file.name,
    size: file.size,
    type: extension || file.type || "file",
    extension,
    mimeType: file.type || "",
    uploadedAt: new Date().toISOString(),
    downloadUrl: objectUrl,
    previewUrl: file.type.startsWith("image/") ? objectUrl : "",
    localOnly: true,
  };
};

const validateFile = (file, signatures) => {
  const extension = getExtension(file.name);

  if (!ATTACHMENT_ALLOWED_EXTENSIONS.includes(extension)) {
    return `"${file.name}" turi ruxsat etilmagan.`;
  }

  if (file.size > ATTACHMENT_MAX_SIZE) {
    return `"${file.name}" 10 MB limitdan katta.`;
  }

  if (
    signatures.has(
      fileSignature({
        name: file.name,
        size: file.size,
        type: extension,
        mimeType: file.type,
      }),
    )
  ) {
    return `"${file.name}" allaqachon biriktirilgan.`;
  }

  return "";
};

// Enterprise Notifications (Supplier Document Expiring): ixtiyoriy — faqat
// `showExpiry` true bo'lganda ko'rsatiladi (masalan Supplier hujjatlari),
// PO/Invoys/To'lov biriktirmalari (`showExpiry` berilmaydi) o'zgarishsiz
// qoladi.
const EXPIRY_SOON_DAYS = 30;

const getExpiryTone = (expiryDate) => {
  if (!expiryDate) return null;

  const days = Math.floor(
    (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
  );

  if (Number.isNaN(days)) return null;
  if (days < 0) return "expired";
  if (days <= EXPIRY_SOON_DAYS) return "soon";

  return "ok";
};

const PurchaseAttachmentManager = ({
  attachments = [],
  title = "Fayllar",
  emptyTitle = "Fayl biriktirilmagan",
  emptyText = "PDF, rasm yoki hujjat fayllarini biriktiring.",
  buttonLabel = "Fayl biriktirish",
  compact = false,
  showExpiry = false,
  onAdd,
  onRemove,
  onSetExpiry,
}) => {
  const inputRef = useRef(null);
  const [errors, setErrors] = useState([]);

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const signatures = new Set(attachments.map(fileSignature));
    const accepted = [];
    const rejected = [];

    selectedFiles.forEach((file) => {
      const error = validateFile(file, signatures);

      if (error) {
        rejected.push(error);
        return;
      }

      const attachment = buildAttachment(file);
      signatures.add(fileSignature(attachment));
      accepted.push(attachment);
    });

    if (accepted.length) onAdd?.(accepted);

    setErrors(rejected);
    event.target.value = "";
  };

  return (
    <div
      className={
        compact
          ? "purchase-attachments purchase-attachments--compact"
          : "purchase-attachments"
      }
    >
      <div className="purchase-attachments__head">
        <span className="purchase-attachments__title">{title}</span>
        <button
          className="purchase-btn purchase-btn--ghost"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          <FileUp size={15} />
          {buttonLabel}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ATTACHMENT_ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
          onChange={handleFiles}
        />
      </div>

      {errors.length > 0 && (
        <div className="purchase-attachments__errors" role="alert">
          <AlertCircle size={15} />
          <div>
            {errors.map((error) => (
              <span key={error}>{error}</span>
            ))}
          </div>
        </div>
      )}

      {attachments.length ? (
        <div className="purchase-attachments__list">
          {attachments.map((file) => (
            <article className="purchase-attachments__item" key={file.id || file.name}>
              <div className="purchase-attachments__preview">
                {isImage(file) && file.previewUrl ? (
                  <img src={file.previewUrl} alt={file.name} />
                ) : isPdf(file) ? (
                  <FileText size={22} />
                ) : isImage(file) ? (
                  <ImageIcon size={22} />
                ) : (
                  <Paperclip size={22} />
                )}
              </div>

              <div className="purchase-attachments__meta">
                <strong title={file.name}>{file.name}</strong>
                <small>
                  {formatFileSize(file.size)} · {getFileTypeLabel(file)} ·{" "}
                  {file.author ? `${file.author} · ` : ""}
                  {formatPurchaseDate(file.uploadedAt || file.createdAt, {
                    withTime: true,
                  })}
                </small>

                {showExpiry && (
                  <div className="purchase-attachments__expiry">
                    <CalendarClock size={12} />
                    <input
                      type="date"
                      value={file.expiryDate || ""}
                      title="Amal qilish muddati"
                      aria-label={`${file.name} — amal qilish muddati`}
                      onChange={(event) => onSetExpiry?.(file, event.target.value)}
                    />
                    {getExpiryTone(file.expiryDate) === "expired" && (
                      <span className="purchase-attachments__expiry-flag purchase-attachments__expiry-flag--expired">
                        <AlertTriangle size={11} />
                        Muddati tugagan
                      </span>
                    )}
                    {getExpiryTone(file.expiryDate) === "soon" && (
                      <span className="purchase-attachments__expiry-flag purchase-attachments__expiry-flag--soon">
                        <AlertTriangle size={11} />
                        Tugamoqda
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="purchase-attachments__actions">
                {file.downloadUrl ? (
                  <a
                    href={file.downloadUrl}
                    download={file.name}
                    title="Yuklab olish"
                    aria-label={`${file.name} faylini yuklab olish`}
                  >
                    <Download size={15} />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    title="Fayl kontenti backend ulanganda yuklanadi"
                    aria-label="Yuklab olish hozircha mavjud emas"
                  >
                    <Download size={15} />
                  </button>
                )}

                <button
                  type="button"
                  title="Olib tashlash"
                  aria-label={`${file.name} faylini olib tashlash`}
                  onClick={() => onRemove?.(file)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="purchase-attachments__empty">
          <Paperclip size={18} />
          <div>
            <strong>{emptyTitle}</strong>
            <span>{emptyText}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseAttachmentManager;
