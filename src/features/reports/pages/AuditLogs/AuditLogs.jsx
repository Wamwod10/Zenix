import { ShieldCheck } from "lucide-react";

import { permissionMatrix } from "../../utils/reportsPermissions";
import "./AuditLogs.scss";

const AuditLogs = ({ controller, mode = "audit" }) => {
  if (mode === "permissions") {
    return (
      <section className="audit-logs">
        <div className="reports-simple-view__head">
          <span className="reports-eyebrow"><ShieldCheck size={14} />Permissions</span>
          <h2>Reports permission matrix</h2>
        </div>
        <div className="audit-logs__matrix">
          {permissionMatrix.map((row) => (
            <article key={row.role}>
              <strong>{row.role}</strong>
              {Object.entries(row).filter(([key]) => key !== "role").map(([key, value]) => (
                <span key={key} className={value ? "is-allowed" : "is-denied"}>{key}</span>
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
        <span className="reports-eyebrow">Audit Logs</span>
        <h2>Report activity history</h2>
      </div>
      <div className="audit-logs__list">
        {controller.state.auditLog.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.action}</strong>
              <span>{item.details}</span>
            </div>
            <small>{item.user} · {item.role} · {item.branch}</small>
            <small>{item.date}</small>
            <i className={item.result === "denied" ? "is-denied" : "is-allowed"}>{item.result}</i>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AuditLogs;
