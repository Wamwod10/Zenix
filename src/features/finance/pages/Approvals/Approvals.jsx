import { useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { approvalMatrix, financeRoles } from "../../data/financePermissions";
import { formatMoney } from "../../utils/financeFormatters";
import { getApprovalRequirement } from "../../utils/financePermissions";

const Approvals = ({ controller }) => {
  const [reject, setReject] = useState({ id: "", reason: "" });
  const pending = controller.state.transactions.filter((item) => item.status === "Pending");
  const roleLabels = Object.fromEntries(financeRoles.map((role) => [role.id, role.label]));

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Tasdiqlash matritsasi</span>
            <h2>Maker-checker tasdiqlari</h2>
          </div>
        </div>
        <div className="finance-card-grid">
          {approvalMatrix.map((rule) => (
            <article className="finance-mini-card" key={rule.id}>
              <strong>{rule.label}</strong>
              <span>{roleLabels[rule.role] || rule.role}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Tasdiq kutmoqda</span>
            <h2>Tasdiq kutayotgan yozuvlar</h2>
          </div>
        </div>
        <div className="finance-table">
          {pending.map((item) => {
            const action = controller.actionState("approve", item);
            const required = getApprovalRequirement(item.amount);

            return (
              <article key={item.id}>
                <div><strong>{item.reference}</strong><span>Yaratuvchi: {item.createdBy}</span></div>
                <b>{formatMoney(item.amount, item.currency)}</b>
                <StatusBadge status="warning" label={roleLabels[required.role] || required.role} />
                <button type="button" disabled={!action.allowed} title={action.reason} onClick={() => controller.actions.approveTransaction(item.id)}>Tasdiqlash</button>
                <button type="button" onClick={() => {
                  setReject({ id: item.id, reason: "" });
                  controller.actions.setActiveModal("approval-reject");
                }}>Rad etish</button>
              </article>
            );
          })}
        </div>
        {!pending.length && <div className="finance-empty">Tasdiq kutayotgan yozuv yo'q.</div>}
      </section>

      <ConfirmDialog
        open={controller.activeModal === "approval-reject"}
        title="Tasdiqni rad etish"
        description="Sabab tranzaksiya audit tarixiga yoziladi."
        confirmLabel="Rad etish"
        onClose={controller.actions.closeModal}
        onConfirm={() => {
          controller.actions.rejectTransaction(reject.id, reject.reason);
          controller.actions.closeModal();
        }}
        confirmDisabled={!reject.reason.trim()}
      >
        <div className="finance-form-grid">
          <label className="finance-form-grid__wide">
            <span>Rad etish sababi</span>
            <textarea value={reject.reason} onChange={(event) => setReject((current) => ({ ...current, reason: event.target.value }))} />
          </label>
        </div>
      </ConfirmDialog>
    </section>
  );
};

export default Approvals;
