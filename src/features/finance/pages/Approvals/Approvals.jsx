import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { approvalMatrix } from "../../data/financePermissions";
import { formatMoney } from "../../utils/financeFormatters";
import { getApprovalRequirement } from "../../utils/financePermissions";

const Approvals = ({ controller }) => {
  const pending = controller.state.transactions.filter((item) => item.status === "Pending");

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Approval matrix</span>
            <h2>Maker-checker tasdiqlari</h2>
          </div>
        </div>
        <div className="finance-card-grid">
          {approvalMatrix.map((rule) => (
            <article className="finance-mini-card" key={rule.id}>
              <strong>{rule.label}</strong>
              <span>{rule.role}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Pending approvals</span>
            <h2>Tasdiq kutayotgan yozuvlar</h2>
          </div>
        </div>
        <div className="finance-table">
          {pending.map((item) => {
            const action = controller.actionState("approve", item);
            const required = getApprovalRequirement(item.amount);

            return (
              <article key={item.id}>
                <div><strong>{item.reference}</strong><span>Maker: {item.createdBy}</span></div>
                <b>{formatMoney(item.amount, item.currency)}</b>
                <StatusBadge status="warning" label={required.role} />
                <button type="button" disabled={!action.allowed} title={action.reason} onClick={() => controller.actions.approveTransaction(item.id)}>Approve</button>
                <button type="button" onClick={() => controller.actions.rejectTransaction(item.id, "Checker rejected from approval panel")}>Reject</button>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
};

export default Approvals;
