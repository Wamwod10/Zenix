import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatDate } from "../../utils/hrFormatters";

const Reports = ({ controller }) => {
  const { state } = controller;

  return (
    <div className="hr-view">
      <section className="hr-grid">
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Reports</span><h2>Approvals, audit, notifications</h2></div></div>
          <div className="hr-list">
            {state.approvals.map((approval) => (
              <article key={approval.id}>
                <strong>{approval.title}</strong>
                <span>{approval.type} · {approval.requester}</span>
                <StatusBadge status={approval.status} />
              </article>
            ))}
          </div>
        </article>
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Audit log</span><h2>Audit-ready events</h2></div></div>
          <div className="hr-list">
            {state.auditLog.slice(0, 8).map((event) => (
              <article key={event.id}>
                <strong>{event.event}</strong>
                <span>{event.area} · {event.by} · {formatDate(event.at)}</span>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default Reports;
