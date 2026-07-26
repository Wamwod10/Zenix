import { useState } from "react";
import { FileText, ShieldCheck, UserRoundCheck } from "lucide-react";

import HRDialog from "../../components/HRDialog/HRDialog";
import HRKpiCard from "../../components/HRKpiCard/HRKpiCard";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { calculateDocumentExpiry, calculateLeaveBalance, calculateProbationDays } from "../../utils/hrCalculations";
import { formatDate, formatEmployeeName, formatMoney, yearsBetween } from "../../utils/hrFormatters";

const tabs = ["Umumiy", "Shaxsiy", "Pasport", "Shartnoma", "Davomat", "Oylik", "Ta'til", "KPI", "Vazifalar", "Hujjatlar", "Mol-mulk", "Timeline", "Notes", "Audit"];

const EmployeeDetails = ({ controller }) => {
  const { selectedEmployee: employee, state, dictionaries } = controller;
  const [activeTab, setActiveTab] = useState("Umumiy");
  const [probationComment, setProbationComment] = useState("");
  const [documentRenewal, setDocumentRenewal] = useState("");
  const [dialog, setDialog] = useState("");
  const salaryVisible = controller.actionState("salary.view").visible;

  if (!employee) {
    return <div className="hr-empty">Xodim tanlanmagan.</div>;
  }

  const probation = calculateProbationDays(employee.probation);
  const leaveBalance = calculateLeaveBalance(state.leaves, employee.id);
  const employeeTasks = state.tasks.filter((task) => task.assigneeIds.includes(employee.id));
  const payroll = state.payroll.find((item) => item.employeeId === employee.id);

  return (
    <div className="hr-view">
      <section className="hr-profile">
        <div className="hr-profile__hero">
          <span className="hr-avatar hr-avatar--large">{employee.photo}</span>
          <div>
            <h2>{formatEmployeeName(employee)}</h2>
            <p>{dictionaries.positionById[employee.positionId]?.title} · {dictionaries.departmentById[employee.departmentId]?.name} · {dictionaries.branchById[employee.branchId]?.name}</p>
            <div className="hr-actions-row">
              <StatusBadge status={employee.status} />
              <span>{yearsBetween(employee.hireDate)} yil staj</span>
              <button type="button" onClick={() => setDialog("probation")}>Probation decision</button>
            </div>
          </div>
        </div>
        <section className="hr-kpi-grid hr-kpi-grid--profile">
          <HRKpiCard icon={UserRoundCheck} label="Attendance" value={`${employee.attendanceRate}%`} meta="Profile KPI" tone="green" />
          <HRKpiCard icon={ShieldCheck} label="KPI score" value={employee.kpiScore} meta="Current period" />
          <HRKpiCard icon={FileText} label="Leave balance" value={leaveBalance} meta="Annual days" tone="orange" />
          <HRKpiCard icon={UserRoundCheck} label="Probation" value={`${probation.progress}%`} meta={`${probation.remaining} kun`} />
          <HRKpiCard icon={ShieldCheck} label="Tasks" value={employeeTasks.length} meta="Open and done" />
        </section>
      </section>

      <section className="hr-panel">
        <div className="hr-tabs" role="tablist" aria-label="Employee profile tabs">
          {tabs.map((tab) => (
            <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Umumiy" && (
          <div className="hr-detail-grid">
            <article><span>Telefon</span><strong>{employee.phone}</strong></article>
            <article><span>Email</span><strong>{employee.email}</strong></article>
            <article><span>Hire date</span><strong>{formatDate(employee.hireDate)}</strong></article>
            <article><span>Role</span><strong>{employee.role}</strong></article>
          </div>
        )}

        {activeTab === "Oylik" && (
          <div className="hr-detail-grid">
            <article><span>Base salary</span><strong>{salaryVisible ? formatMoney(employee.salary) : "Permission hidden"}</strong></article>
            <article><span>Payroll status</span><strong>{payroll?.status || "No payroll"}</strong></article>
            <article><span>Bank card</span><strong>{controller.actionState("bank.view").visible ? employee.bankCard : "Hidden"}</strong></article>
          </div>
        )}

        {activeTab === "Hujjatlar" && (
          <div className="hr-list">
            {employee.documents.map((document) => {
              const expiry = calculateDocumentExpiry(document);
              return (
                <article key={document.id}>
                  <strong>{document.type}</strong>
                  <span>{formatDate(document.issueDate)} - {formatDate(document.expiryDate)} · {expiry.remaining} kun</span>
                  <StatusBadge status={expiry.status} />
                  <button type="button" onClick={() => setDialog(document.id)}>Renew</button>
                </article>
              );
            })}
          </div>
        )}

        {!["Umumiy", "Oylik", "Hujjatlar"].includes(activeTab) && (
          <div className="hr-list">
            <article>
              <strong>{activeTab}</strong>
              <span>Mock 360 profile ma'lumotlari, permission va auditga tayyor adapter orqali kengayadi.</span>
            </article>
            {employee.notes.map((note) => <article key={note}><strong>Note</strong><span>{note}</span></article>)}
          </div>
        )}
      </section>

      <HRDialog open={dialog === "probation"} title="Probation decision" onClose={() => setDialog("")}>
        <div className="hr-form-grid">
          <label className="hr-form-grid__wide">
            Comment required
            <textarea value={probationComment} onChange={(event) => setProbationComment(event.target.value)} />
          </label>
        </div>
        <div className="hr-actions-row">
          <button type="button" onClick={() => controller.actions.decideProbation(employee.id, "confirm", probationComment)}>Confirm</button>
          <button type="button" onClick={() => controller.actions.decideProbation(employee.id, "extend", probationComment)}>Extend</button>
          <button type="button" onClick={() => controller.actions.decideProbation(employee.id, "terminate", probationComment)}>Terminate</button>
        </div>
      </HRDialog>

      <HRDialog open={Boolean(dialog && dialog !== "probation")} title="Document renew" onClose={() => setDialog("")}>
        <div className="hr-form-grid">
          <label>
            New expiry
            <input type="date" value={documentRenewal} onChange={(event) => setDocumentRenewal(event.target.value)} />
          </label>
        </div>
        <button type="button" onClick={() => controller.actions.renewDocument(employee.id, dialog, documentRenewal)}>Saqlash</button>
      </HRDialog>
    </div>
  );
};

export default EmployeeDetails;
