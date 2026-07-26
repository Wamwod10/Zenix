import { useEffect, useState } from "react";
import { X } from "lucide-react";

import "./SettingsModal.scss";

const SettingsModal = ({ type, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const title = type === "restore" ? "Restore confirmation" : type === "share" ? "Share settings" : "Import / Export";

  return (
    <div className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <button className="settings-modal__backdrop" type="button" aria-label="Modalni yopish" onClick={onClose} />
      <section className="settings-modal__panel">
        <header>
          <div>
            <span>Settings operation</span>
            <h2 id="settings-modal-title">{title}</h2>
            <p>Frontend simulation backend adapter bilan ajratilgan.</p>
          </div>
          <button type="button" aria-label="Yopish" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="settings-modal__body">
          {type === "restore" ? (
            <label>
              <span>Restore reason</span>
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
            </label>
          ) : (
            <div className="settings-modal__cards">
              <article><strong>JSON export</strong><small>Current settings snapshot tayyorlanadi.</small></article>
              <article><strong>Template import</strong><small>38 valid row preview simulation.</small></article>
              <article><strong>Role-aware share</strong><small>Owner/Admin uchun restricted link.</small></article>
            </div>
          )}
        </div>
        <footer>
          <button type="button" onClick={onClose}>Bekor qilish</button>
          <button type="button" className="is-primary" onClick={() => onConfirm?.(reason)}>
            Tasdiqlash
          </button>
        </footer>
      </section>
    </div>
  );
};

export default SettingsModal;
