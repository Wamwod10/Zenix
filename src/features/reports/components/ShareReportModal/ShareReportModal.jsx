import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";

import "./ShareReportModal.scss";

const ShareReportModal = ({ open, reportName, onClose, onShare }) => {
  const [form, setForm] = useState({
    channel: "ZENIX notification",
    recipient: "CEO",
    permission: "View Only",
  });

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("reports-scroll-lock");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("reports-scroll-lock");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="reports-modal" role="dialog" aria-modal="true" aria-label="Share report">
      <button className="reports-modal__backdrop" type="button" aria-label="Close share" onClick={onClose} />
      <section className="reports-modal__panel">
        <div className="reports-modal__head">
          <div>
            <span>Sharing</span>
            <h2>{reportName}</h2>
          </div>
          <button type="button" aria-label="Close share modal" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="reports-modal__form">
          {[
            ["channel", ["ZENIX notification", "email", "Telegram", "PDF", "Excel", "CSV"]],
            ["recipient", ["CEO", "Finance Manager", "Warehouse Manager", "HR Manager", "Branch Manager"]],
            ["permission", ["View Only", "Edit"]],
          ].map(([key, options]) => (
            <label key={key}>
              <span>{key}</span>
              <select value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}>
                {options.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          ))}
        </div>
        <div className="reports-modal__footer">
          <button type="button" onClick={onClose}>Bekor qilish</button>
          <button type="button" className="is-primary" onClick={() => onShare({ ...form, reportName })}>
            <Send size={15} />
            Share
          </button>
        </div>
      </section>
    </div>
  );
};

export default ShareReportModal;
