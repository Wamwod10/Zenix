import { useState } from "react";
import { Send, X } from "lucide-react";

import { useReportsOverlay } from "../../hooks/useReportsOverlay";
import { getReportTitle } from "../../utils/reportsFormatters";
import ReportsField from "../ReportsField/ReportsField";
import "./ShareReportModal.scss";

const ShareReportModal = ({ open, reportName, pending, onClose, onShare }) => {
  const [form, setForm] = useState({
    channel: "ZENIX notification",
    recipient: "CEO",
    permission: "View Only",
    expiry: "7",
  });
  const [error, setError] = useState("");
  const panelRef = useReportsOverlay(open, onClose);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  if (!open) return null;

  const submit = () => {
    if (!form.recipient || !form.channel || !form.permission || !form.expiry) {
      setError("Barcha majburiy maydonlarni to'ldiring.");
      return;
    }
    setError("");
    onShare({ ...form, reportName });
  };

  return (
    <div className="reports-modal" role="dialog" aria-modal="true" aria-label="Hisobotni ulashish">
      <button className="reports-modal__backdrop" type="button" aria-label="Ulashish oynasini yopish" onClick={onClose} />
      <section className="reports-modal__panel" ref={panelRef}>
        <div className="reports-modal__head">
          <div>
            <span>Ulashish</span>
            <h2>{getReportTitle(reportName)}</h2>
          </div>
          <button type="button" aria-label="Ulashish oynasini yopish" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="reports-modal__summary">
          <strong>{getReportTitle(reportName)}</strong>
          <span>{form.permission} ruxsat, {form.expiry} kun amal qiladi</span>
        </div>

        <div className="reports-modal__form">
          <ReportsField
            label="Kanal"
            type="select"
            value={form.channel}
            options={["ZENIX notification", "email", "Telegram", "PDF link", "Excel link"]}
            onChange={(value) => update("channel", value)}
          />
          <ReportsField
            label="Qabul qiluvchi"
            type="select"
            value={form.recipient}
            options={["CEO", "Finance Manager", "Warehouse Manager", "HR Manager", "Branch Manager"]}
            onChange={(value) => update("recipient", value)}
          />
          <ReportsField
            label="Ruxsat"
            type="select"
            value={form.permission}
            options={[
              { value: "View Only", label: "Faqat ko'rish" },
              { value: "Edit", label: "Tahrirlash" },
            ]}
            onChange={(value) => update("permission", value)}
          />
          <ReportsField
            label="Amal qilish muddati"
            type="select"
            value={form.expiry}
            options={[
              { value: "1", label: "1 kun" },
              { value: "7", label: "7 kun" },
              { value: "30", label: "30 kun" },
            ]}
            onChange={(value) => update("expiry", value)}
          />
        </div>
        {error && <p className="reports-modal__result is-error">{error}</p>}
        <div className="reports-modal__footer">
          <button type="button" onClick={onClose}>Bekor qilish</button>
          <button type="button" className="is-primary" disabled={pending} onClick={submit}>
            <Send size={15} />
            {pending ? "Yuborilmoqda..." : "Ulashish"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ShareReportModal;
