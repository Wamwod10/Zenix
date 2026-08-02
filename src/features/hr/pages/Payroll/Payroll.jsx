import { useState } from "react";
import { Calculator, CreditCard, FileText, ShieldCheck } from "lucide-react";

import HRDialog from "../../components/HRDialog/HRDialog";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { calculatePayroll } from "../../utils/hrCalculations";
import { formatEmployeeName, formatMoney } from "../../utils/hrFormatters";

const nextAction = {
  Draft: "Calculated",
  Calculated: "Approved",
  Approved: "Paid",
};

const Payroll = ({ controller }) => {
  const { state, dictionaries, mutationStatus } = controller;
  const [previewId, setPreviewId] = useState("");
  const config = state.settings.payrollConfig;
  const previewEntry = state.payroll.find((entry) => entry.id === previewId);
  const previewResult = previewEntry ? previewEntry.result || calculatePayroll(previewEntry, config) : null;

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head">
          <div>
            <span>Oylik</span>
            <h2>Oylik, bonus, ushlanma va payslip</h2>
          </div>
          <StatusBadge status="warning" label="Qoidalar bilan hisoblanadi" />
        </div>
        <div className="hr-warning">{config.legalNotice}</div>
        <div className="hr-table">
          {state.payroll.map((entry) => {
            const employee = dictionaries.employeeById[entry.employeeId];
            const result = entry.result || calculatePayroll(entry, config);
            const pending = mutationStatus[`payroll.${entry.id}.calculate`]?.pending;
            const next = nextAction[entry.status];

            return (
              <article key={entry.id}>
                <div>
                  <strong>{formatEmployeeName(employee)}</strong>
                  <span>{entry.period} - {entry.workedDays} kun / {entry.workedHours} soat</span>
                  {result.validationErrors.map((error) => <small className="hr-field-error" key={error}>{error}</small>)}
                </div>
                <b>{formatMoney(entry.baseSalary)}</b>
                <b>{formatMoney(Number(entry.bonus || 0) + Number(result.overtime || 0))}</b>
                <b>{formatMoney(Number(entry.advance || 0) + Number(entry.penalty || 0) + Number(entry.deductions || 0))}</b>
                <b>{formatMoney(result.net)}</b>
                <StatusBadge status={entry.status} />
                <div className="hr-actions-row">
                  <button type="button" disabled={pending || entry.status !== "Draft"} onClick={() => controller.actions.calculatePayrollEntry(entry.id)}>
                    <Calculator size={14} /> {pending ? "Hisoblanmoqda" : "Hisoblash"}
                  </button>
                  <button type="button" disabled={next !== "Approved"} onClick={() => controller.actions.transitionPayroll(entry.id, "Approved")}>
                    <ShieldCheck size={14} /> Tasdiqlash
                  </button>
                  <button type="button" disabled={next !== "Paid"} onClick={() => controller.actions.transitionPayroll(entry.id, "Paid")}>
                    <CreditCard size={14} /> To'lash
                  </button>
                  <button type="button" onClick={() => setPreviewId(entry.id)}>
                    <FileText size={14} /> Payslip
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="hr-grid">
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Analitika</span><h2>Oylik fondi tarkibi</h2></div></div>
          <div className="hr-chart-bars">
            {state.payroll.map((entry) => {
              const result = entry.result || calculatePayroll(entry, config);
              return (
                <span key={entry.id} style={{ "--value": `${Math.min((result.net / Math.max(result.gross, 1)) * 100, 100)}%` }}>
                  <b>{dictionaries.employeeById[entry.employeeId]?.code}</b>
                </span>
              );
            })}
          </div>
        </article>
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Sozlamalar</span><h2>Payroll qoidalari</h2></div></div>
          <div className="hr-detail-grid">
            <article><span>Soliq stavkasi</span><strong>{config.taxRate * 100}%</strong></article>
            <article><span>INPS</span><strong>{config.inpsRate * 100}%</strong></article>
            <article><span>Standart kun</span><strong>{config.standardDays}</strong></article>
            <article><span>Overtime</span><strong>{config.overtimeMultiplier}x</strong></article>
          </div>
        </article>
      </section>

      <HRDialog open={Boolean(previewEntry)} title="Payslip ko'rish" onClose={() => setPreviewId("")}>
        {previewEntry && previewResult && (
          <div className="hr-detail-grid">
            <article><span>Xodim</span><strong>{formatEmployeeName(dictionaries.employeeById[previewEntry.employeeId])}</strong></article>
            <article><span>Gross</span><strong>{formatMoney(previewResult.gross)}</strong></article>
            <article><span>Soliq</span><strong>{formatMoney(previewResult.tax)}</strong></article>
            <article><span>INPS</span><strong>{formatMoney(previewResult.inps)}</strong></article>
            <article><span>Ushlanmalar</span><strong>{formatMoney(previewResult.reductions)}</strong></article>
            <article><span>Net oylik</span><strong>{formatMoney(previewResult.net)}</strong></article>
          </div>
        )}
        <div className="hr-actions-row">
          <button type="button" onClick={() => window.print()}>Chop etish</button>
          <button type="button" onClick={() => controller.actions.addNotification("Payslip yuklab olish adapteri tayyor.")}>Yuklab olish</button>
        </div>
      </HRDialog>
    </div>
  );
};

export default Payroll;
