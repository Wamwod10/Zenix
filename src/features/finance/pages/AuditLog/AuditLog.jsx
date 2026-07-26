import { formatDateTime } from "../../utils/financeFormatters";

const AuditLog = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Audit trail</span>
          <h2>O'zgarmas moliyaviy iz</h2>
        </div>
      </div>
      <div className="finance-timeline">
        {controller.state.auditLog.map((item) => (
          <article key={item.id}>
            <strong>{item.event}</strong>
            <span>{item.area} · {item.by} · {formatDateTime(item.at)}</span>
          </article>
        ))}
      </div>
    </section>
  </section>
);

export default AuditLog;
