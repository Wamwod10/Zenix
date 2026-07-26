import { Calculator, CreditCard, ShieldCheck } from "lucide-react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { calculatePayroll } from "../../utils/hrCalculations";
import { formatEmployeeName, formatMoney } from "../../utils/hrFormatters";

const Payroll = ({ controller }) => {
  const { state, dictionaries } = controller;
  const config = state.settings.payrollConfig;

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head">
          <div>
            <span>Payroll</span>
            <h2>Oylik, avans, bonus, jarima va payslip</h2>
          </div>
          <StatusBadge status="warning" label="Config based" />
        </div>
        <div className="hr-warning">{config.legalNotice}</div>
        <div className="hr-table">
          {state.payroll.map((entry) => {
            const employee = dictionaries.employeeById[entry.employeeId];
            const result = entry.result || calculatePayroll(entry, config);
            return (
              <article key={entry.id}>
                <div>
                  <strong>{formatEmployeeName(employee)}</strong>
                  <span>{entry.period} · {entry.workedDays} kun / {entry.workedHours} soat</span>
                </div>
                <b>{formatMoney(entry.baseSalary)}</b>
                <b>{formatMoney(entry.bonus + entry.overtime)}</b>
                <b>{formatMoney(entry.advance + entry.penalty + entry.deductions)}</b>
                <b>{formatMoney(result.net)}</b>
                <StatusBadge status={entry.status} />
                <div className="hr-actions-row">
                  <button type="button" onClick={() => controller.actions.calculatePayrollEntry(entry.id)}>
                    <Calculator size={14} /> Calculate
                  </button>
                  <button type="button" onClick={() => controller.actions.transitionPayroll(entry.id, "Approved")}>
                    <ShieldCheck size={14} /> Approve
                  </button>
                  <button type="button" onClick={() => controller.actions.transitionPayroll(entry.id, "Paid")}>
                    <CreditCard size={14} /> Pay
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="hr-grid">
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Payslip preview</span><h2>Net salary breakdown</h2></div></div>
          <div className="hr-list">
            {state.payroll.slice(0, 2).map((entry) => {
              const result = entry.result || calculatePayroll(entry, config);
              return (
                <article key={`slip-${entry.id}`}>
                  <strong>{formatEmployeeName(dictionaries.employeeById[entry.employeeId])}</strong>
                  <span>Gross {formatMoney(result.gross)} · Tax {formatMoney(result.tax)} · INPS {formatMoney(result.inps)}</span>
                  <b>{formatMoney(result.net)}</b>
                </article>
              );
            })}
          </div>
        </article>
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Analytics</span><h2>Payroll history</h2></div></div>
          <div className="hr-detail-grid">
            <article><span>Tax rate</span><strong>{config.taxRate * 100}%</strong></article>
            <article><span>INPS</span><strong>{config.inpsRate * 100}%</strong></article>
            <article><span>Standard days</span><strong>{config.standardDays}</strong></article>
            <article><span>Overtime</span><strong>{config.overtimeMultiplier}x</strong></article>
          </div>
        </article>
      </section>
    </div>
  );
};

export default Payroll;
