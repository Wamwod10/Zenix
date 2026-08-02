import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, FileText, ShieldCheck, UserRoundCheck } from "lucide-react";

import HRDialog from "../../components/HRDialog/HRDialog";
import HRKpiCard from "../../components/HRKpiCard/HRKpiCard";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { calculateAttendanceRate, calculateDocumentExpiry, calculateLeaveBalance, calculateProbationDays } from "../../utils/hrCalculations";
import { formatDate, formatEmployeeName, formatMoney, yearsBetween } from "../../utils/hrFormatters";

const documentTypeLabels = {
  passport: "Pasport",
  contract: "Shartnoma",
  "medical examination": "Tibbiy ko'rik",
  license: "Litsenziya",
  certificate: "Sertifikat",
};

const tabs = [
  { id: "overview", label: "Umumiy" },
  { id: "personal", label: "Shaxsiy" },
  { id: "passport", label: "Pasport" },
  { id: "contract", label: "Shartnoma" },
  { id: "attendance", label: "Davomat" },
  { id: "payroll", label: "Oylik" },
  { id: "leave", label: "Ta'til" },
  { id: "kpi", label: "KPI" },
  { id: "tasks", label: "Vazifalar" },
  { id: "documents", label: "Hujjatlar" },
  { id: "assets", label: "Mol-mulk" },
  { id: "timeline", label: "Timeline" },
  { id: "notes", label: "Izohlar" },
  { id: "audit", label: "Audit" },
];

const EmptyBlock = ({ title, text }) => (
  <div className="hr-empty">
    <strong>{title}</strong>
    <span>{text}</span>
  </div>
);

const EmployeeDetails = ({ controller, onNavigate }) => {
  const { employeeId } = useParams();
  const { state, dictionaries } = controller;
  const employee = state.employees.find((item) => item.id === employeeId);
  const [activeTab, setActiveTab] = useState("overview");
  const [probationComment, setProbationComment] = useState("");
  const [documentRenewal, setDocumentRenewal] = useState("");
  const [dialog, setDialog] = useState("");
  const salaryVisible = controller.actionState("salary.view").visible;
  const bankVisible = controller.actionState("bank.view").visible;
  const canDecideProbation = controller.actionState("probation.decide").visible;
  const canEditDocument = controller.actionState("document.edit").visible;

  const related = useMemo(() => {
    if (!employee) return {};
    return {
      attendance: state.attendance.filter((item) => item.employeeId === employee.id),
      leaves: state.leaves.filter((item) => item.employeeId === employee.id),
      tasks: state.tasks.filter((task) => (task.assigneeIds || []).includes(employee.id)),
      payroll: state.payroll.find((item) => item.employeeId === employee.id),
      performance: state.performance.find((item) => item.employeeId === employee.id),
      audit: state.auditLog.filter((item) => item.event.includes(employee.id)),
    };
  }, [employee, state]);

  if (!employee) {
    return (
      <div className="hr-view">
        <section className="hr-panel">
          <div className="hr-empty">
            <strong>Xodim topilmadi.</strong>
            <span>URLdagi employee ID bo'yicha ma'lumot topilmadi.</span>
            <button type="button" onClick={() => onNavigate("employees")}>Ro'yxatga qaytish</button>
          </div>
        </section>
      </div>
    );
  }

  const probation = calculateProbationDays(employee.probation);
  const leaveBalance = calculateLeaveBalance(state.leaves, employee.id);
  const attendanceRate = calculateAttendanceRate(state.attendance, employee.id) || employee.attendanceRate;
  const payroll = related.payroll;

  const decideProbation = (decision) => {
    if (controller.actions.decideProbation(employee.id, decision, probationComment)) {
      setDialog("");
      setProbationComment("");
    }
  };

  const renewDocument = async () => {
    const ok = await controller.actions.renewDocument(employee.id, dialog, documentRenewal);
    if (ok) {
      setDialog("");
      setDocumentRenewal("");
    }
  };

  const onTabsKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.id === activeTab);
    if (event.key === "ArrowRight") setActiveTab(tabs[Math.min(index + 1, tabs.length - 1)].id);
    if (event.key === "ArrowLeft") setActiveTab(tabs[Math.max(index - 1, 0)].id);
    if (event.key === "Home") setActiveTab(tabs[0].id);
    if (event.key === "End") setActiveTab(tabs[tabs.length - 1].id);
  };

  return (
    <div className="hr-view">
      <section className="hr-profile">
        <div className="hr-breadcrumb">
          <button type="button" onClick={() => onNavigate("employees")}>
            <ArrowLeft size={15} /> Xodimlar
          </button>
          <span>{employee.code}</span>
        </div>
        <div className="hr-profile__hero">
          <span className="hr-avatar hr-avatar--large">{employee.photo}</span>
          <div>
            <h2>{formatEmployeeName(employee)}</h2>
            <p>{dictionaries.positionById[employee.positionId]?.title} - {dictionaries.departmentById[employee.departmentId]?.name} - {dictionaries.branchById[employee.branchId]?.name}</p>
            <div className="hr-actions-row">
              <StatusBadge status={employee.status} />
              <span>{yearsBetween(employee.hireDate)} yil staj</span>
              {["active", "ending-soon", "decision-pending"].includes(employee.probation?.status) && canDecideProbation && (
                <button type="button" onClick={() => setDialog("probation")}>Sinov muddati qarori</button>
              )}
            </div>
          </div>
        </div>
        <section className="hr-kpi-grid hr-kpi-grid--profile">
          <HRKpiCard icon={UserRoundCheck} label="Davomat" value={`${attendanceRate}%`} meta="Davomat yozuvlaridan" tone="green" />
          <HRKpiCard icon={ShieldCheck} label="KPI" value={employee.kpiScore} meta="Joriy davr" />
          <HRKpiCard icon={FileText} label="Ta'til qoldig'i" value={leaveBalance} meta="Yillik kunlar" tone="orange" />
          <HRKpiCard icon={UserRoundCheck} label="Sinov muddati" value={`${probation.progress}%`} meta={`${probation.remaining} kun`} />
          <HRKpiCard icon={ShieldCheck} label="Vazifalar" value={related.tasks.length} meta="Ochiq va bajarilgan" />
        </section>
      </section>

      <section className="hr-panel">
        <div className="hr-tabs" role="tablist" aria-label="Xodim profili bo'limlari" onKeyDown={onTabsKeyDown}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`hr-tab-${tab.id}`}
              aria-controls={`hr-panel-${tab.id}`}
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? "is-active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`hr-panel-${activeTab}`} aria-labelledby={`hr-tab-${activeTab}`}>
          {activeTab === "overview" && (
            <div className="hr-detail-grid">
              <article><span>Telefon</span><strong>{employee.phone}</strong></article>
              <article><span>Email</span><strong>{employee.email}</strong></article>
              <article><span>Ishga qabul sanasi</span><strong>{formatDate(employee.hireDate)}</strong></article>
              <article><span>Rol</span><strong>{employee.role}</strong></article>
            </div>
          )}

          {activeTab === "personal" && (
            <div className="hr-detail-grid">
              <article><span>Tug'ilgan sana</span><strong>{formatDate(employee.birthDate)}</strong></article>
              <article><span>Filial</span><strong>{dictionaries.branchById[employee.branchId]?.name}</strong></article>
              <article><span>Bo'lim</span><strong>{dictionaries.departmentById[employee.departmentId]?.name}</strong></article>
              <article><span>Lavozim</span><strong>{dictionaries.positionById[employee.positionId]?.title}</strong></article>
            </div>
          )}

          {activeTab === "passport" && (
            <div className="hr-detail-grid">
              <article><span>PINFL</span><strong>{employee.pinfl}</strong></article>
              <article><span>Pasport</span><strong>{employee.passport}</strong></article>
            </div>
          )}

          {activeTab === "contract" && (
            <div className="hr-detail-grid">
              <article><span>Sinov holati</span><strong>{employee.probation?.status}</strong></article>
              <article><span>Boshlanishi</span><strong>{formatDate(employee.probation?.startDate)}</strong></article>
              <article><span>Tugashi</span><strong>{formatDate(employee.probation?.endDate)}</strong></article>
              <article><span>Menejer</span><strong>{formatEmployeeName(dictionaries.employeeById[employee.probation?.managerId])}</strong></article>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="hr-list">
              {related.attendance.map((row) => <article key={row.id}><strong>{row.date}</strong><span>{row.checkIn || "--:--"} - {row.checkOut || "--:--"} - {row.method}</span><StatusBadge status={row.status} /></article>)}
              {!related.attendance.length && <EmptyBlock title="Davomat yozuvi yo'q" text="Bu xodim uchun davomat yozuvlari hali kiritilmagan." />}
            </div>
          )}

          {activeTab === "payroll" && (
            <div className="hr-detail-grid">
              <article><span>Asosiy oylik</span><strong>{salaryVisible ? formatMoney(employee.salary) : "Oylik ma'lumoti yashirilgan"}</strong></article>
              <article><span>Payroll holati</span><strong>{payroll?.status || "Oylik yozuvi yo'q"}</strong></article>
              <article><span>Bank karta</span><strong>{bankVisible ? employee.bankCard : "Bank ma'lumoti yashirilgan"}</strong></article>
            </div>
          )}

          {activeTab === "leave" && (
            <div className="hr-list">
              {related.leaves.map((leave) => <article key={leave.id}><strong>{leave.type}</strong><span>{leave.from} - {leave.to} - {leave.days} kun</span><StatusBadge status={leave.status} /></article>)}
              {!related.leaves.length && <EmptyBlock title="Ta'til so'rovi yo'q" text="Bu xodim uchun ta'til tarixi hali yo'q." />}
            </div>
          )}

          {activeTab === "kpi" && (
            related.performance ? (
              <div className="hr-detail-grid">
                <article><span>Davomat KPI</span><strong>{related.performance.attendance}%</strong></article>
                <article><span>Vazifa bajarilishi</span><strong>{related.performance.taskCompletion}%</strong></article>
                <article><span>Samaradorlik</span><strong>{related.performance.efficiency}%</strong></article>
                <article><span>Review</span><strong>{related.performance.review}</strong></article>
              </div>
            ) : <EmptyBlock title="KPI yozuvi yo'q" text="Joriy davr uchun baholash topilmadi." />
          )}

          {activeTab === "tasks" && (
            <div className="hr-list">
              {related.tasks.map((task) => <article key={task.id}><strong>{task.title}</strong><span>{task.deadline} - {task.priority}</span><StatusBadge status={task.status} /></article>)}
              {!related.tasks.length && <EmptyBlock title="Vazifa yo'q" text="Bu xodimga biriktirilgan vazifa topilmadi." />}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="hr-list">
              {(employee.documents || []).map((document) => {
                const expiry = calculateDocumentExpiry(document);
                return (
                  <article key={document.id}>
                    <strong>{documentTypeLabels[document.type] || document.type}</strong>
                    <span>{formatDate(document.issueDate)} - {formatDate(document.expiryDate)} - {expiry.remaining} kun</span>
                    <StatusBadge status={expiry.status} />
                    {canEditDocument && <button type="button" onClick={() => setDialog(document.id)}>Yangilash</button>}
                  </article>
                );
              })}
            </div>
          )}

          {activeTab === "assets" && (
            <div className="hr-list">
              {(employee.assets || []).map((asset) => <article key={asset}><strong>{asset}</strong><span>Xodimga biriktirilgan mol-mulk</span></article>)}
              {!employee.assets.length && <EmptyBlock title="Mol-mulk yo'q" text="Bu xodimga aktiv biriktirilmagan." />}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="hr-list">
              <article><strong>Ishga qabul</strong><span>{formatDate(employee.hireDate)}</span></article>
              {employee.terminationDate && <article><strong>Bo'shash</strong><span>{formatDate(employee.terminationDate)} - {employee.terminationReason}</span></article>}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="hr-list">
              {(employee.notes || []).map((note) => <article key={note}><strong>Izoh</strong><span>{note}</span></article>)}
              {!employee.notes.length && <EmptyBlock title="Izoh yo'q" text="Bu profilga izoh qo'shilmagan." />}
            </div>
          )}

          {activeTab === "audit" && (
            <div className="hr-list">
              {related.audit.map((item) => <article key={item.id}><strong>{item.event}</strong><span>{item.by} - {formatDate(item.at)}</span></article>)}
              {!related.audit.length && <EmptyBlock title="Audit yozuvi yo'q" text="Bu xodim bo'yicha alohida audit harakati topilmadi." />}
            </div>
          )}
        </div>
      </section>

      <HRDialog open={dialog === "probation"} title="Sinov muddati qarori" onClose={() => setDialog("")}>
        <div className="hr-form-grid">
          <label className="hr-form-grid__wide">
            Qaror izohi
            <textarea value={probationComment} onChange={(event) => setProbationComment(event.target.value)} />
          </label>
        </div>
        <div className="hr-actions-row">
          <button type="button" disabled={!probationComment.trim()} onClick={() => decideProbation("confirm")}>Tasdiqlash</button>
          <button type="button" disabled={!probationComment.trim()} onClick={() => decideProbation("extend")}>Uzaytirish</button>
          <button type="button" disabled={!probationComment.trim()} onClick={() => decideProbation("terminate")}>Bekor qilish</button>
        </div>
      </HRDialog>

      <HRDialog open={Boolean(dialog && dialog !== "probation")} title="Hujjat muddatini yangilash" onClose={() => setDialog("")}>
        <div className="hr-form-grid">
          <label>
            Yangi muddat
            <input type="date" value={documentRenewal} onChange={(event) => setDocumentRenewal(event.target.value)} />
          </label>
        </div>
        <button type="button" disabled={!documentRenewal} onClick={renewDocument}>Saqlash</button>
      </HRDialog>
    </div>
  );
};

export default EmployeeDetails;
