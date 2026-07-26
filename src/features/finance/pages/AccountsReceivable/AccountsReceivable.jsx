import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatMoney } from "../../utils/financeFormatters";

const AccountsReceivable = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Customer credit</span>
          <h2>Accounts Receivable</h2>
        </div>
      </div>
      <div className="finance-table">
        {controller.state.receivables.map((item) => (
          <article key={item.id}>
            <div><strong>{item.customer}</strong><span>{item.invoice} · due {item.dueDate}</span></div>
            <b>{formatMoney(item.balance)}</b>
            <StatusBadge status={item.status === "overdue" ? "danger" : "success"} label={item.status} />
            <button type="button" onClick={() => controller.actions.addNotification(`${item.customer} uchun reminder yaratildi.`)}>Reminder</button>
          </article>
        ))}
      </div>
    </section>
  </section>
);

export default AccountsReceivable;
