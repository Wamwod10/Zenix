import { GlassSelect } from "@/components/ui";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  Paperclip,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  CRM_ATTACHMENT_ACCEPTED_TYPES,
  CRM_ATTACHMENT_ACCEPT_VALUE,
  CRM_ATTACHMENT_MAX_SIZE,
  crmAttachmentCategories,
  getCustomerAttachments,
} from "../../data/crmAttachments";
import { formatDate } from "../../utils/crmFormatters";
import "./CustomerAttachments.scss";

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (mimeType = "") => {
  if (mimeType.startsWith("image/")) {
    return FileImage;
  }

  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return FileSpreadsheet;
  }

  if (
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("document")
  ) {
    return FileText;
  }

  return File;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () =>
      reject(new Error(`${file.name} faylini o‘qib bo‘lmadi.`)),
    );

    reader.readAsDataURL(file);
  });

const createAttachmentId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `attachment-${crypto.randomUUID()}`;
  }

  return `attachment-${Date.now().toString(36)}`;
};

const CustomerAttachments = ({ customerId, canManageAttachments = true }) => {
  const inputRef = useRef(null);
  const cancelDeleteRef = useRef(null);
  const [attachments, setAttachments] = useState(() =>
    getCustomerAttachments(customerId),
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);

  useEffect(() => {
    setAttachments(getCustomerAttachments(customerId));
    setFeedback(null);
  }, [customerId]);

  useEffect(() => {
    if (!attachmentToDelete) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelDeleteRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setAttachmentToDelete(null);
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = document.querySelector(
        ".crm-customer-attachments__dialog",
      );
      const focusableElements = dialog?.querySelectorAll(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements?.length) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [attachmentToDelete]);

  const processFiles = async (fileList) => {
    const files = Array.from(fileList ?? []);

    if (!files.length || isUploading) {
      return;
    }

    const existingNames = new Set(
      attachments.map((attachment) => attachment.name.toLowerCase()),
    );
    const acceptedNames = new Set();
    const validationErrors = [];
    const validFiles = [];

    files.forEach((file) => {
      const normalizedName = file.name.toLowerCase();

      if (!CRM_ATTACHMENT_ACCEPTED_TYPES.includes(file.type)) {
        validationErrors.push(
          `${file.name}: bu fayl formatiga ruxsat berilmagan.`,
        );
        return;
      }

      if (file.size > CRM_ATTACHMENT_MAX_SIZE) {
        validationErrors.push(`${file.name}: fayl hajmi 10 MB dan katta.`);
        return;
      }

      if (
        existingNames.has(normalizedName) ||
        acceptedNames.has(normalizedName)
      ) {
        validationErrors.push(
          `${file.name}: shu nomdagi fayl allaqachon mavjud.`,
        );
        return;
      }

      acceptedNames.add(normalizedName);
      validFiles.push(file);
    });

    if (!validFiles.length) {
      setFeedback({
        type: "error",
        message: validationErrors[0] ?? "Yuklash uchun mos fayl topilmadi.",
      });
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const newAttachments = await Promise.all(
        validFiles.map(async (file) => ({
          id: createAttachmentId(),
          customerId,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          category: "other",
          uploadedBy: "Joriy foydalanuvchi",
          createdAt: new Date().toISOString(),
          source: "local",
          previewUrl: await readFileAsDataUrl(file),
        })),
      );

      setAttachments((current) => [...newAttachments, ...current]);

      setFeedback({
        type: validationErrors.length ? "warning" : "success",
        message: validationErrors.length
          ? `${newAttachments.length} ta fayl yuklandi. ${validationErrors[0]}`
          : `${newAttachments.length} ta fayl muvaffaqiyatli yuklandi.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Fayllarni yuklab bo‘lmadi.",
      });
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (canManageAttachments) {
      processFiles(event.dataTransfer.files);
    }
  };

  const handleDownload = (attachment) => {
    if (attachment.previewUrl) {
      const anchor = document.createElement("a");
      anchor.href = attachment.previewUrl;
      anchor.download = attachment.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      return;
    }

    const demoContent = [
      "ZENIX CRM — demo attachment",
      `Fayl: ${attachment.name}`,
      `Kategoriya: ${crmAttachmentCategories[attachment.category] ?? "Boshqa"}`,
      `Yuklagan: ${attachment.uploadedBy}`,
      `Sana: ${formatDate(attachment.createdAt)}`,
      "",
      "Real backend ulanganda asl fayl shu action orqali yuklanadi.",
    ].join("\n");

    const blob = new Blob([demoContent], {
      type: "text/plain;charset=utf-8",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const baseName = attachment.name.replace(/\.[^/.]+$/, "");

    anchor.href = downloadUrl;
    anchor.download = `${baseName}-demo.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
  };

  const handlePreview = (attachment) => {
    if (!attachment.previewUrl) {
      return;
    }

    const previewWindow = window.open(
      attachment.previewUrl,
      "_blank",
      "noopener,noreferrer",
    );

    if (!previewWindow) {
      setFeedback({
        type: "error",
        message:
          "Preview oynasi bloklandi. Brauzer popup ruxsatini tekshiring.",
      });
    }
  };

  const handleCategoryChange = (attachmentId, category) => {
    setAttachments((current) =>
      current.map((attachment) =>
        attachment.id === attachmentId
          ? { ...attachment, category }
          : attachment,
      ),
    );

    setFeedback({
      type: "success",
      message: "Fayl kategoriyasi yangilandi.",
    });
  };

  const confirmDelete = () => {
    if (!attachmentToDelete) {
      return;
    }

    setAttachments((current) =>
      current.filter((attachment) => attachment.id !== attachmentToDelete.id),
    );

    setFeedback({
      type: "success",
      message: `${attachmentToDelete.name} o‘chirildi.`,
    });
    setAttachmentToDelete(null);
  };

  return (
    <section
      className="crm-customer-attachments"
      aria-labelledby="crm-customer-attachments-title"
    >
      <div className="crm-customer-attachments__header">
        <div>
          <span>Hujjatlar va media</span>
          <h2 id="crm-customer-attachments-title">Mijoz fayllari</h2>
          <p>
            Shartnoma, hisob-faktura va boshqa muhim hujjatlarni bir joyda
            saqlang.
          </p>
        </div>

        <span className="crm-customer-attachments__total">
          <Paperclip size={15} aria-hidden="true" />
          {attachments.length} ta fayl
        </span>
      </div>

      {canManageAttachments ? (
        <div
          className={
            isDragging
              ? "crm-customer-attachments__dropzone crm-customer-attachments__dropzone--active"
              : "crm-customer-attachments__dropzone"
          }
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsDragging(false);
            }
          }}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            id="crm-customer-attachment-input"
            className="crm-customer-attachments__input"
            type="file"
            multiple
            accept={CRM_ATTACHMENT_ACCEPT_VALUE}
            disabled={isUploading}
            onChange={(event) => processFiles(event.target.files)}
          />

          <div
            className="crm-customer-attachments__upload-icon"
            aria-hidden="true"
          >
            {isUploading ? (
              <LoaderCircle
                className="crm-customer-attachments__spinner"
                size={24}
              />
            ) : (
              <UploadCloud size={24} />
            )}
          </div>

          <div className="crm-customer-attachments__upload-copy">
            <strong>
              {isUploading
                ? "Fayllar yuklanmoqda"
                : "Fayllarni shu yerga tashlang"}
            </strong>
            <span>PDF, JPG, PNG, WEBP, DOCX yoki XLSX · 10 MB gacha</span>
          </div>

          <label
            className="crm-customer-attachments__upload-button"
            htmlFor="crm-customer-attachment-input"
            aria-disabled={isUploading}
          >
            Fayl tanlash
          </label>
        </div>
      ) : (
        <div className="crm-customer-attachments__permission">
          <AlertCircle size={19} aria-hidden="true" />
          <p>
            Siz fayllarni ko‘rishingiz mumkin, lekin yangi fayl yuklash yoki
            o‘chirish uchun ruxsatingiz yo‘q.
          </p>
        </div>
      )}

      {feedback ? (
        <div
          className={`crm-customer-attachments__feedback crm-customer-attachments__feedback--${feedback.type}`}
          role="status"
          aria-live="polite"
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={18} aria-hidden="true" />
          ) : (
            <AlertCircle size={18} aria-hidden="true" />
          )}

          <span>{feedback.message}</span>

          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Xabarni yopish"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      {attachments.length > 0 ? (
        <div className="crm-customer-attachments__list">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.mimeType);
            const canPreview = Boolean(attachment.previewUrl);

            return (
              <article
                className="crm-customer-attachments__item"
                key={attachment.id}
              >
                <div
                  className="crm-customer-attachments__file-icon"
                  aria-hidden="true"
                >
                  <FileIcon size={21} />
                </div>

                <div className="crm-customer-attachments__file-copy">
                  <strong title={attachment.name}>{attachment.name}</strong>

                  <span>
                    {formatFileSize(attachment.size)} ·{" "}
                    {formatDate(attachment.createdAt)}
                  </span>

                  <small>{attachment.uploadedBy} tomonidan yuklangan</small>
                </div>

                <GlassSelect
                  value={attachment.category}
                  disabled={!canManageAttachments}
                  onChange={(event) =>
                    handleCategoryChange(attachment.id, event.target.value)
                  }
                  aria-label={`${attachment.name} kategoriyasi`}
                >
                  {Object.entries(crmAttachmentCategories).map(
                    ([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ),
                  )}
                </GlassSelect>

                <div className="crm-customer-attachments__actions">
                  <button
                    type="button"
                    disabled={!canPreview}
                    onClick={() => handlePreview(attachment)}
                    aria-label={`${attachment.name} faylini ko‘rish`}
                    title={
                      canPreview
                        ? "Faylni ko‘rish"
                        : "Demo fayl uchun preview mavjud emas"
                    }
                  >
                    <Eye size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(attachment)}
                    aria-label={`${attachment.name} faylini yuklab olish`}
                    title="Yuklab olish"
                  >
                    <Download size={17} />
                  </button>

                  {canManageAttachments ? (
                    <button
                      type="button"
                      className="crm-customer-attachments__delete-button"
                      onClick={() => setAttachmentToDelete(attachment)}
                      aria-label={`${attachment.name} faylini o‘chirish`}
                      title="O‘chirish"
                    >
                      <Trash2 size={17} />
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="crm-customer-attachments__empty">
          <Paperclip size={25} aria-hidden="true" />
          <strong>Biriktirilgan fayllar hali yo‘q</strong>
          <p>
            Birinchi hujjatni yuklash uchun yuqoridagi maydondan foydalaning.
          </p>
        </div>
      )}

      {attachmentToDelete ? (
        <div
          className="crm-customer-attachments__backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAttachmentToDelete(null);
            }
          }}
        >
          <div
            className="crm-customer-attachments__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crm-delete-attachment-title"
          >
            <div
              className="crm-customer-attachments__dialog-icon"
              aria-hidden="true"
            >
              <Trash2 size={22} />
            </div>

            <h3 id="crm-delete-attachment-title">Fayl o‘chirilsinmi?</h3>

            <p>
              <strong>{attachmentToDelete.name}</strong> fayli ro‘yxatdan
              o‘chiriladi. Bu amalni ortga qaytarib bo‘lmaydi.
            </p>

            <div className="crm-customer-attachments__dialog-actions">
              <button
                ref={cancelDeleteRef}
                type="button"
                onClick={() => setAttachmentToDelete(null)}
              >
                Bekor qilish
              </button>

              <button type="button" onClick={confirmDelete}>
                <Trash2 size={16} aria-hidden="true" />
                O‘chirish
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default CustomerAttachments;
