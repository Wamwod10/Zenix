import { GlassSelect } from "@/components/ui";
import { useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatStatusLabel } from "../../utils/financeFormatters";

const steps = ["Tekshiruv", "Validatsiya", "Tasdiqlash", "Yopish"];

const FinancialClosing = ({ controller }) => {
  const [reopen, setReopen] = useState({ periodId: "2026-06", reason: "" });
  const complete = controller.state.closingChecklist.filter((item) => item.complete).length;

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Period yopish wizardi</span>
            <h2>Tekshiruvdan yopishgacha</h2>
          </div>
          <StatusBadge status={complete === controller.state.closingChecklist.length ? "success" : "warning"} label={`${complete}/${controller.state.closingChecklist.length}`} />
        </div>
        <div className="closing-steps">
          {steps.map((item, index) => (
            <article key={item} className={index === 0 || complete === controller.state.closingChecklist.length ? "is-active" : ""}>
              <strong>{item}</strong>
              <span>{index === 0 ? "Tekshiruvlar" : "Checklist tugaganda ochiladi"}</span>
            </article>
          ))}
        </div>
        <div className="finance-list">
          {controller.state.closingChecklist.map((item) => (
            <button type="button" key={item.id} onClick={() => controller.actions.toggleChecklist(item.id)}>
              <strong>{item.label}</strong>
              <StatusBadge status={item.complete ? "success" : "danger"} label={item.complete ? "Bajarilgan" : "Ochiq"} />
            </button>
          ))}
        </div>
        <div className="finance-actions-row">
          <button type="button" className="finance-button is-primary" onClick={controller.actions.closePeriod}>
            Periodni yopish
          </button>
          <button type="button" className="finance-button is-danger" onClick={() => controller.actions.setActiveModal("reopen-period")}>
            Qayta ochish
          </button>
        </div>
      </section>

      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Periodlar</span>
            <h2>Yopish holati</h2>
          </div>
        </div>
        <div className="finance-card-grid">
          {controller.state.periods.map((period) => (
            <article className="finance-mini-card" key={period.id}>
              <strong>{period.label}</strong>
              <StatusBadge status={period.status === "open" ? "success" : "warning"} label={formatStatusLabel(period.status)} />
              <span>{period.lockedBy || "Yopilmagan"}</span>
            </article>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={controller.activeModal === "reopen-period"}
        title="Yopilgan periodni qayta ochish"
        description="Qayta ochish faqat ruxsatli rol bilan, sabab va audit orqali bajariladi."
        confirmLabel="Qayta ochish"
        onClose={controller.actions.closeModal}
        onConfirm={() => {
          controller.actions.reopenPeriod(reopen.periodId, reopen.reason);
          controller.actions.closeModal();
        }}
        confirmDisabled={!reopen.reason.trim()}
      >
        <div className="finance-form-grid">
          <label>
            <span>Period</span>
            <GlassSelect value={reopen.periodId} onChange={(event) => setReopen((current) => ({ ...current, periodId: event.target.value }))}>
              {controller.state.periods.map((period) => (
                <option key={period.id} value={period.id}>{period.label}</option>
              ))}
            </GlassSelect>
          </label>
          <label className="finance-form-grid__wide">
            <span>Sabab</span>
            <textarea value={reopen.reason} onChange={(event) => setReopen((current) => ({ ...current, reason: event.target.value }))} />
          </label>
        </div>
      </ConfirmDialog>
    </section>
  );
};

export default FinancialClosing;
