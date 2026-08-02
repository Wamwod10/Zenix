import { useEffect, useRef, useState } from "react";
import { Download, Upload, Users, X } from "lucide-react";

import "./SettingsModal.scss";

const modalCopy = {
  import: {
    eyebrow: "Import",
    title: "Sozlamalarni import qilish",
    description: "JSON yoki CSV faylni tanlang, preview va validatsiyadan keyin qo'llang.",
  },
  share: {
    eyebrow: "Ulashish",
    title: "Sozlamalarni ulashish",
    description: "Kimga va qaysi ruxsat bilan yuborilishini belgilang.",
  },
  export: {
    eyebrow: "Eksport",
    title: "Sozlamalarni eksport qilish",
    description: "Joriy sahifa sozlamalarini yuklab olish uchun format tanlang.",
  },
  restore: {
    eyebrow: "Tiklash",
    title: "Backup tiklash tasdig'i",
    description: "Tanlangan backup versiyasi tasdiqlashdan keyin tiklanadi.",
  },
};

const SettingsModal = ({ type, backup, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [fileMeta, setFileMeta] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [error, setError] = useState("");
  const panelRef = useRef(null);
  const previousFocus = useRef(null);
  const copy = modalCopy[type] || modalCopy.export;
  const restoreInvalid = type === "restore" && !reason.trim();

  useEffect(() => {
    previousFocus.current = document.activeElement;
    const focusable = panelRef.current?.querySelector("button, input, textarea, select");
    focusable?.focus();

    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key !== "Tab" || !panelRef.current) return;

      const items = [...panelRef.current.querySelectorAll("button, input, textarea, select")]
        .filter((item) => !item.disabled);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previousFocus.current?.focus?.();
    };
  }, [onClose]);

  const confirm = () => {
    if (restoreInvalid) {
      setError("Tiklash sababini kiriting.");
      panelRef.current?.querySelector("textarea")?.focus();
      return;
    }
    if (type === "share" && shareEmail && !shareEmail.includes("@")) {
      setError("Email manzilini to'g'ri kiriting.");
      return;
    }
    onConfirm?.({ reason, fileMeta, shareEmail });
  };

  return (
    <div className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <button className="settings-modal__backdrop" type="button" aria-label="Modalni yopish" onClick={onClose} />
      <section className="settings-modal__panel" ref={panelRef}>
        <header>
          <div>
            <span>{copy.eyebrow}</span>
            <h2 id="settings-modal-title">{copy.title}</h2>
            <p>{copy.description}</p>
          </div>
          <button type="button" aria-label="Yopish" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="settings-modal__body">
          {type === "restore" && (
            <label className={error ? "is-error" : ""}>
              <span>Tiklash sababi</span>
              {backup && <small>{backup.version} - {backup.sizeGb} GB - {backup.status}</small>}
              <textarea
                value={reason}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "settings-restore-error" : undefined}
                onChange={(event) => {
                  setReason(event.target.value);
                  setError("");
                }}
              />
              {error && <small id="settings-restore-error">{error}</small>}
            </label>
          )}

          {type === "import" && (
            <div className="settings-modal__cards">
              <label>
                <Upload size={18} />
                <span>Fayl tanlash</span>
                <input
                  type="file"
                  accept=".json,.csv,application/json,text/csv"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setFileMeta(file ? { name: file.name, size: file.size, type: file.type || "unknown" } : null);
                  }}
                />
              </label>
              <article><strong>Preview</strong><small>{fileMeta ? `${fileMeta.name} - ${Math.round(fileMeta.size / 1024)} KB` : "Fayl tanlanmagan"}</small></article>
              <article><strong>Validatsiya</strong><small>Majburiy maydonlar va formatlar tekshiriladi.</small></article>
            </div>
          )}

          {type === "share" && (
            <div className="settings-modal__cards">
              <label className={error ? "is-error" : ""}>
                <Users size={18} />
                <span>Email</span>
                <input value={shareEmail} placeholder="admin@zenix.uz" onChange={(event) => setShareEmail(event.target.value)} />
              </label>
              <article><strong>Ruxsat</strong><small>Faqat ko'rish havolasi, 7 kun amal qiladi.</small></article>
              <article><strong>Audit</strong><small>Ulashish hodisasi audit logga yoziladi.</small></article>
              {error && <small className="settings-modal__error">{error}</small>}
            </div>
          )}

          {type === "export" && (
            <div className="settings-modal__cards">
              <article><Download size={18} /><strong>JSON</strong><small>Joriy sozlamalar snapshoti.</small></article>
              <article><strong>CSV</strong><small>Jadval ma'lumotlari uchun.</small></article>
              <article><strong>Audit</strong><small>Eksport hodisasi qayd etiladi.</small></article>
            </div>
          )}
        </div>
        <footer>
          <button type="button" onClick={onClose}>Bekor qilish</button>
          <button type="button" className="is-primary" disabled={restoreInvalid} onClick={confirm}>
            Tasdiqlash
          </button>
        </footer>
      </section>
    </div>
  );
};

export default SettingsModal;
