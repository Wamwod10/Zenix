import { GlassSelect } from "@/components/ui";
import { useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatMoney } from "../../utils/financeFormatters";

const Budget = ({ controller }) => {
  const [form, setForm] = useState({ category: "", period: controller.state.settings.currentPeriodId, planned: "", owner: "" });

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Budget workflow</span>
            <h2>Budget rejalari</h2>
          </div>
          <button type="button" className="finance-button is-primary" onClick={() => controller.actions.setActiveModal("create-budget")}>Budget reja yaratish</button>
        </div>
        <div className="finance-card-grid">
          {controller.state.budgets.map((budget) => {
            const progress = Math.round((Number(budget.actual || 0) / Math.max(Number(budget.planned || 0), 1)) * 100);
            return (
              <article className="finance-mini-card" key={budget.id}>
                <StatusBadge status={budget.status} />
                <strong>{budget.category}</strong>
                <span>{budget.period} | mas'ul {budget.owner}</span>
                <b>{formatMoney(budget.actual)} / {formatMoney(budget.planned)}</b>
                <span>{Math.min(progress, 100)}% ishlatilgan</span>
                <button type="button" disabled={budget.status !== "Pending"} onClick={() => controller.actions.approveBudget(budget.id)}>Tasdiqlash</button>
              </article>
            );
          })}
        </div>
      </section>

      <ConfirmDialog
        open={controller.activeModal === "create-budget"}
        title="Budget reja yaratish"
        description="Budget reja qoralama yoki tasdiq kutayotgan holatda saqlanadi."
        confirmLabel="Tasdiqqa yuborish"
        onClose={controller.actions.closeModal}
        onConfirm={() => {
          if (controller.actions.createBudget({ ...form, submit: true })) {
            setForm({ category: "", period: controller.state.settings.currentPeriodId, planned: "", owner: "" });
            controller.actions.closeModal();
          }
        }}
        confirmDisabled={!form.category.trim() || Number(form.planned || 0) <= 0}
      >
        <div className="finance-form-grid">
          <label><span>Kategoriya</span><input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} /></label>
          <label><span>Period</span><GlassSelect value={form.period} onChange={(event) => setForm((current) => ({ ...current, period: event.target.value }))}>{controller.state.periods.map((period) => <option key={period.id} value={period.id}>{period.label}</option>)}</GlassSelect></label>
          <label><span>Reja summa</span><input type="number" min="1" value={form.planned} onChange={(event) => setForm((current) => ({ ...current, planned: event.target.value }))} /></label>
          <label><span>Mas'ul</span><input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} /></label>
        </div>
        <button type="button" className="finance-button" onClick={() => controller.actions.createBudget({ ...form, submit: false })}>Qoralama saqlash</button>
      </ConfirmDialog>
    </section>
  );
};

export default Budget;
