import { Download, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { reportsRoles } from "../../data/reportsMockData";
import { permissionMatrix } from "../../utils/reportsPermissions";
import { normalizeSearch } from "../../utils/reportsFormatters";
import "./AuditLogs.scss";

const roleLabel = (role) => reportsRoles.find((item) => item.id === role)?.label || role;
const actionLabels = {
  view: "Ko'rish",
  export: "Eksport",
  print: "Print",
  share: "Ulashish",
  create: "Yaratish",
  edit: "Tahrirlash",
  delete: "O'chirish",
  schedule: "Schedule",
  aiAccess: "Aqlli tahlil",
  executiveAccess: "Rahbar xulosasi",
  builderAccess: "Konstruktor",
};

const auditLabels = {
  "report opened": "Hisobot ochildi",
  "filter changed": "Filter o'zgardi",
  "report created": "Hisobot yaratildi",
  "report exported": "Hisobot eksport qilindi",
  "report shared": "Hisobot ulashildi",
  "permission denied": "Ruxsat rad etildi",
  "widget changed": "Widget o'zgardi",
  "scheduled report created": "Schedule o'zgardi",
  success: "Muvaffaqiyatli",
  denied: "Rad etildi",
};

const AuditLogs = ({ controller, mode = "audit" }) => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const rows = useMemo(() => {
    const normalized = normalizeSearch(query);
    return controller.state.auditLog.filter((item) => normalizeSearch(`${item.action} ${item.details} ${item.user} ${item.role} ${item.result}`).includes(normalized));
  }, [controller.state.auditLog, query]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize);

  if (mode === "permissions") {
    return (
      <section className="audit-logs">
        <div className="reports-simple-view__head">
          <span className="reports-eyebrow"><ShieldCheck size={14} />Ruxsatlar</span>
          <h2>Hisobotlar ruxsat matrixi</h2>
          <p>Har bir rol qaysi amalni bajarishi mumkinligi ko'rsatilgan.</p>
        </div>
        <div className="audit-logs__matrix">
          {permissionMatrix.map((row) => (
            <article key={row.role}>
              <strong>{roleLabel(row.role)}</strong>
              {Object.entries(row).filter(([key]) => key !== "role").map(([key, value]) => (
                <span key={key} className={value ? "is-allowed" : "is-denied"}>{actionLabels[key] || key}</span>
              ))}
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="audit-logs">
      <div className="reports-simple-view__head">
        <span className="reports-eyebrow">Audit jurnali</span>
        <h2>Hisobot faoliyati tarixi</h2>
      </div>
      <div className="audit-logs__toolbar">
        <label>
          <Search size={14} />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="User, action yoki natija bo'yicha qidirish" />
        </label>
        <button type="button" onClick={() => controller.actions.exportReport("CSV", "audit")}>
          <Download size={14} />
          CSV
        </button>
      </div>
      <div className="audit-logs__list">
        {pageRows.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{auditLabels[item.action] || item.action}</strong>
              <span>{item.details}</span>
            </div>
            <small>{item.user} / {roleLabel(item.role)} / {item.branch}</small>
            <small>{item.date}</small>
            <i className={item.result === "denied" ? "is-denied" : "is-allowed"}>{auditLabels[item.result] || item.result}</i>
          </article>
        ))}
      </div>
      <div className="reports-table-card__pagination">
        <button type="button" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>Oldingi</button>
        <span>{page + 1} / {pageCount}</span>
        <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>Keyingi</button>
      </div>
    </section>
  );
};

export default AuditLogs;
