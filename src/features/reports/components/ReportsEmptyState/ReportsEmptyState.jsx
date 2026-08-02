import { SearchX, Sparkles } from "lucide-react";

import "./ReportsEmptyState.scss";

const ReportsEmptyState = ({
  title = "Ma'lumot topilmadi",
  text = "Filterlarni yumshatib qayta urinib ko'ring.",
  actionLabel,
  onAction,
}) => (
  <section className="reports-empty-state">
    <span><SearchX size={22} /></span>
    <h3>{title}</h3>
    <p>{text}</p>
    {actionLabel && (
      <button type="button" onClick={onAction}>
        {actionLabel}
      </button>
    )}
    <small>
      <Sparkles size={13} />
      AI tavsiya: date range yoki risk filterini reset qilish foydali.
    </small>
  </section>
);

export default ReportsEmptyState;
