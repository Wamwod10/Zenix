import { Eye, Send, ShieldCheck } from "lucide-react";

import { formatMoney } from "../../utils/financeFormatters";
import StatusBadge from "../StatusBadge/StatusBadge";

import "./TransactionTable.scss";

const TransactionTable = ({
  transactions,
  onOpen,
  onSubmit,
  onApprove,
  actionState,
}) => (
  <div className="transaction-table">
    <div className="transaction-table__head" role="row">
      <span>ID</span>
      <span>Counterparty</span>
      <span>Amount</span>
      <span>Status</span>
      <span>Actions</span>
    </div>

    {transactions.map((item) => {
      const approveState = actionState("approve", item);

      return (
        <article className="transaction-table__row" key={item.id}>
          <button type="button" onClick={() => onOpen(item.id)}>
            <strong>{item.reference}</strong>
            <small>{item.date} · {item.source}</small>
          </button>
          <span>{item.counterparty}</span>
          <strong>{formatMoney(item.amount, item.currency)}</strong>
          <StatusBadge status={item.status} />
          <div className="transaction-table__actions">
            <button type="button" aria-label="Tafsilotlarni ochish" onClick={() => onOpen(item.id)}>
              <Eye size={15} />
            </button>
            <button
              type="button"
              aria-label="Tasdiqqa yuborish"
              disabled={item.status !== "Draft"}
              onClick={() => onSubmit(item.id)}
            >
              <Send size={15} />
            </button>
            <button
              type="button"
              aria-label={approveState.reason || "Tasdiqlash"}
              title={approveState.reason}
              disabled={!approveState.allowed || item.status !== "Pending"}
              onClick={() => onApprove(item.id)}
            >
              <ShieldCheck size={15} />
            </button>
          </div>
        </article>
      );
    })}
  </div>
);

export default TransactionTable;
