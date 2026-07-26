import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatMoney } from "../../utils/financeFormatters";

const AccountsPayable = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Supplier credit</span>
          <h2>Accounts Payable</h2>
        </div>
      </div>
      <div className="finance-table">
        {controller.state.payables.map((item) => (
          <article key={item.id}>
            <div><strong>{item.supplier}</strong><span>{item.bill} · due {item.dueDate}</span></div>
            <b>{formatMoney(item.balance)}</b>
            <StatusBadge status={item.status === "partial" ? "warning" : "Pending"} label={item.status} />
            <button type="button" onClick={() => controller.actions.addNotification(`${item.supplier} payment order preview yaratildi.`)}>Payment order</button>
          </article>
        ))}
      </div>
    </section>
  </section>
);

export default AccountsPayable;
