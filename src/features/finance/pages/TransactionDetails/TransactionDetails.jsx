import { useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import TransactionLifecycle from "../../components/TransactionLifecycle/TransactionLifecycle";
import { formatDateTime, formatMoney, formatSource, formatTransactionType } from "../../utils/financeFormatters";

const TransactionDetails = ({ controller }) => {
  const transaction = controller.selectedTransaction;
  const [reason, setReason] = useState("");

  if (!transaction) {
    return <section className="finance-empty">Tranzaksiya tanlanmagan.</section>;
  }

  const postState = controller.actionState("post", transaction);
  const reverseState = controller.actionState("reverse", transaction);
  const approveState = controller.actionState("approve", transaction);
  const account = controller.state.accounts.find((item) => item.id === transaction.accountId);

  const openReasonModal = (name) => {
    setReason("");
    controller.actions.setActiveModal(name);
  };

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Tranzaksiya tafsiloti</span>
            <h2>{transaction.reference}</h2>
          </div>
          <StatusBadge status={transaction.status} />
        </div>

        <TransactionLifecycle status={transaction.status} />

        <div className="finance-detail-grid">
          {[
            ["ID", transaction.id],
            ["Tur", formatTransactionType(transaction.type)],
            ["Hamkor", transaction.counterparty],
            ["Summa", formatMoney(transaction.amount, transaction.currency)],
            ["Sana", transaction.date],
            ["Manba", formatSource(transaction.source)],
            ["Yaratgan", transaction.createdBy],
            ["Tasdiqlagan", transaction.approvedBy || "Kutilmoqda"],
            ["Hisob", account ? `${account.code} | ${account.name}` : "Hisob topilmadi"],
          ].map(([label, value]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>

        <div className="finance-actions-row">
          <button type="button" className="finance-button" disabled={transaction.status !== "Draft"} onClick={() => controller.actions.submitTransaction(transaction.id)}>
            Tasdiqqa yuborish
          </button>
          <button type="button" className="finance-button" disabled={!approveState.allowed || transaction.status !== "Pending"} title={approveState.reason} onClick={() => controller.actions.approveTransaction(transaction.id)}>
            Tasdiqlash
          </button>
          <button type="button" className="finance-button is-primary" disabled={!postState.allowed} title={postState.reason} onClick={() => controller.actions.postTransaction(transaction.id)}>
            O'tkazish
          </button>
          <button type="button" className="finance-button is-danger" disabled={!reverseState.allowed} title={reverseState.reason} onClick={() => openReasonModal("reverse")}>
            Storno
          </button>
          <button type="button" className="finance-button is-danger" disabled={transaction.status !== "Pending"} onClick={() => openReasonModal("reject")}>
            Rad etish
          </button>
          <button type="button" className="finance-button" disabled={transaction.status === "Posted" || transaction.status === "Archived"} onClick={() => openReasonModal("cancel")}>
            Bekor qilish
          </button>
          <button type="button" className="finance-button" disabled={transaction.status === "Archived"} onClick={() => controller.actions.archiveTransaction(transaction.id)}>
            Arxivlash
          </button>
        </div>
      </section>

      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Audit tarixi</span>
            <h2>O'zgarmas iz</h2>
          </div>
        </div>
        <div className="finance-timeline">
          {(transaction.audit || []).map((item) => (
            <article key={`${item.at}-${item.event}`}>
              <strong>{item.event}</strong>
              <span>{item.by} | {formatDateTime(item.at)}</span>
            </article>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={controller.activeModal === "reverse"}
        title="Tranzaksiyani storno qilish"
        description="O'tkazilgan yozuv o'chirilmaydi. U teskari yozuv va audit sababi bilan storno qilinadi."
        confirmLabel="Storno qilish"
        onClose={controller.actions.closeModal}
        onConfirm={() => {
          controller.actions.reverseTransaction(transaction.id, reason);
          controller.actions.closeModal();
        }}
        confirmDisabled={!reason.trim()}
      >
        <div className="finance-form-grid">
          <label className="finance-form-grid__wide">
            <span>Storno sababi</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
          </label>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={controller.activeModal === "reject"}
        title="Tranzaksiyani rad etish"
        description="Rad etish sababi audit tarixiga yoziladi."
        confirmLabel="Rad etish"
        onClose={controller.actions.closeModal}
        onConfirm={() => {
          controller.actions.rejectTransaction(transaction.id, reason);
          controller.actions.closeModal();
        }}
        confirmDisabled={!reason.trim()}
      >
        <div className="finance-form-grid">
          <label className="finance-form-grid__wide">
            <span>Rad etish sababi</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
          </label>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={controller.activeModal === "cancel"}
        title="Tranzaksiyani bekor qilish"
        description="Bekor qilingan yozuv auditda qoladi va qayta o'tkazilmaydi."
        confirmLabel="Bekor qilish"
        onClose={controller.actions.closeModal}
        onConfirm={() => {
          controller.actions.cancelTransaction(transaction.id, reason);
          controller.actions.closeModal();
        }}
        confirmDisabled={!reason.trim()}
      >
        <div className="finance-form-grid">
          <label className="finance-form-grid__wide">
            <span>Bekor qilish sababi</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
          </label>
        </div>
      </ConfirmDialog>
    </section>
  );
};

export default TransactionDetails;
