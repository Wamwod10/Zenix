import { useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import TransactionLifecycle from "../../components/TransactionLifecycle/TransactionLifecycle";
import { formatDateTime, formatMoney } from "../../utils/financeFormatters";

const TransactionDetails = ({ controller }) => {
  const transaction = controller.selectedTransaction;
  const [reason, setReason] = useState("");

  if (!transaction) {
    return <section className="finance-empty">Transaction tanlanmagan.</section>;
  }

  const postState = controller.actionState("post", transaction);
  const reverseState = controller.actionState("reverse", transaction);
  const approveState = controller.actionState("approve", transaction);

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Transaction detail</span>
            <h2>{transaction.reference}</h2>
          </div>
          <StatusBadge status={transaction.status} />
        </div>

        <TransactionLifecycle status={transaction.status} />

        <div className="finance-detail-grid">
          {[
            ["ID", transaction.id],
            ["Counterparty", transaction.counterparty],
            ["Amount", formatMoney(transaction.amount, transaction.currency)],
            ["Date", transaction.date],
            ["Source", transaction.source],
            ["Created by", transaction.createdBy],
            ["Approved by", transaction.approvedBy || "Kutilmoqda"],
            ["Account", transaction.accountId],
          ].map(([label, value]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>

        <div className="finance-actions-row">
          <button type="button" className="finance-button" disabled={transaction.status !== "Draft"} onClick={() => controller.actions.submitTransaction(transaction.id)}>
            Submit
          </button>
          <button type="button" className="finance-button" disabled={!approveState.allowed || transaction.status !== "Pending"} title={approveState.reason} onClick={() => controller.actions.approveTransaction(transaction.id)}>
            Approve
          </button>
          <button type="button" className="finance-button is-primary" disabled={!postState.allowed} title={postState.reason} onClick={() => controller.actions.postTransaction(transaction.id)}>
            Post
          </button>
          <button type="button" className="finance-button is-danger" disabled={!reverseState.allowed} title={reverseState.reason} onClick={() => controller.actions.setActiveModal("reverse")}>
            Reverse
          </button>
        </div>
      </section>

      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Audit history</span>
            <h2>Immutable iz</h2>
          </div>
        </div>
        <div className="finance-timeline">
          {(transaction.audit || []).map((item) => (
            <article key={`${item.at}-${item.event}`}>
              <strong>{item.event}</strong>
              <span>{item.by} · {formatDateTime(item.at)}</span>
            </article>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={controller.activeModal === "reverse"}
        title="Posted transaction storno"
        description="Posted yozuv o'chirilmaydi. Faqat teskari yozuv va audit bilan reversed qilinadi."
        confirmLabel="Reverse"
        onClose={controller.actions.closeModal}
        onConfirm={() => {
          controller.actions.reverseTransaction(transaction.id, reason);
          controller.actions.closeModal();
        }}
        confirmDisabled={!reason.trim()}
      >
        <div className="finance-form-grid">
          <label className="finance-form-grid__wide">
            <span>Reverse sababi</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
          </label>
        </div>
      </ConfirmDialog>
    </section>
  );
};

export default TransactionDetails;
