import {
  AlertTriangle,
  Banknote,
  CalendarCheck,
  Cake,
  FileWarning,
  Sparkles,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";

import HRKpiCard from "../../components/HRKpiCard/HRKpiCard";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { calculateDocumentExpiry, calculateProbationDays } from "../../utils/hrCalculations";
import { formatDate, formatMoney, formatEmployeeName } from "../../utils/hrFormatters";

const isBirthdayInDays = (date, days) => {
  const today = new Date("2026-07-23T00:00:00");
  const target = new Date(date);
  target.setFullYear(today.getFullYear());
  const diff = Math.round((target - today) / (24 * 60 * 60 * 1000));
  return diff >= 0 && diff <= days;
};

const HRDashboard = ({ controller, onNavigate }) => {
  const { state, summary, aiInsights, dictionaries } = controller;
  const birthdays = state.employees.filter((employee) => isBirthdayInDays(employee.birthDate, 7));
  const probation = state.employees.filter((employee) =>
    ["ending-soon", "decision-pending", "active"].includes(employee.probation?.status),
  );
  const documentRisks = state.employees.flatMap((employee) =>
    employee.documents
      .map((document) => ({ employee, document, expiry: calculateDocumentExpiry(document) }))
      .filter((item) => ["warning", "critical", "expired"].includes(item.expiry.status)),
  );

  const cards = [
    { label: "Jami faol xodimlar", value: summary.totalActive, meta: "Barcha filial", icon: Users, view: "employees" },
    { label: "Bugun ishda", value: summary.todayPresent, meta: `${summary.attendanceRate}% davomat`, icon: UserCheck, tone: "green", view: "attendance" },
    { label: "Ta'tilda / kasal", value: `${summary.leavesToday}/${summary.sickToday}`, meta: "Bugungi holat", icon: CalendarCheck, tone: "orange", view: "leaves" },
    { label: "Kechikkanlar", value: summary.lateToday, meta: "Manual correction ready", icon: AlertTriangle, tone: "red", view: "attendance" },
    { label: "Yangi / bo'shagan", value: `${summary.newHires}/${summary.terminated}`, meta: "Iyul 2026", icon: UserMinus, view: "employees" },
    { label: "Oylik fondi", value: formatMoney(summary.payrollFund), meta: "Config based payroll", icon: Banknote, view: "payroll" },
    { label: "Pending approval", value: summary.pendingApprovals, meta: "Leave, payroll", icon: FileWarning, tone: "orange", view: "reports" },
    { label: "Open vacancies", value: summary.openVacancies, meta: "Recruitment", icon: Sparkles, view: "recruitment" },
  ];

  return (
    <div className="hr-view">
      <section className="hr-kpi-grid">
        {cards.map((card, index) => (
          <HRKpiCard
            key={card.label}
            {...card}
            index={index}
            onClick={() => onNavigate(card.view)}
          />
        ))}
      </section>

      <section className="hr-grid hr-grid--wide">
        <article className="hr-panel">
          <div className="hr-panel__head">
            <div>
              <span>AI HR summary</span>
              <h2>Inson qarori uchun tavsiyalar</h2>
            </div>
            <StatusBadge status="warning" label={`${aiInsights.length} insight`} />
          </div>
          <div className="hr-list">
            {aiInsights.slice(0, 5).map((insight) => (
              <article key={insight.id}>
                <strong>{insight.title}</strong>
                <span>{insight.message}</span>
                <div className="hr-actions-row">
                  <button type="button" onClick={() => controller.actions.runAiAction(insight, insight.action)}>
                    {insight.action}
                  </button>
                  <button type="button" onClick={() => controller.actions.addNotification("AI insight dismissed.", "warning")}>
                    dismiss
                  </button>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="hr-panel">
          <div className="hr-panel__head">
            <div>
              <span>Birthdays</span>
              <h2>Bugun va 7 kun ichida</h2>
            </div>
            <Cake size={20} />
          </div>
          <div className="hr-list">
            {birthdays.map((employee) => (
              <article key={employee.id}>
                <strong>{formatEmployeeName(employee)}</strong>
                <span>{formatDate(employee.birthDate)} · {dictionaries.branchById[employee.branchId]?.name}</span>
                <button type="button" onClick={() => controller.actions.greetBirthday(employee.id)}>
                  Tabriklash
                </button>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="hr-grid">
        <article className="hr-panel">
          <div className="hr-panel__head">
            <div>
              <span>Probation</span>
              <h2>Sinov muddati nazorati</h2>
            </div>
          </div>
          <div className="hr-list">
            {probation.map((employee) => {
              const meta = calculateProbationDays(employee.probation);
              return (
                <article key={employee.id}>
                  <strong>{formatEmployeeName(employee)}</strong>
                  <span>{meta.remaining} kun qoldi · progress {meta.progress}%</span>
                  <meter min="0" max="100" value={meta.progress} />
                </article>
              );
            })}
          </div>
        </article>

        <article className="hr-panel">
          <div className="hr-panel__head">
            <div>
              <span>Document expiry</span>
              <h2>Muddati yaqin hujjatlar</h2>
            </div>
          </div>
          <div className="hr-list">
            {documentRisks.map(({ employee, document, expiry }) => (
              <article key={`${employee.id}-${document.id}`}>
                <strong>{formatEmployeeName(employee)} · {document.type}</strong>
                <span>{formatDate(document.expiryDate)} · {expiry.remaining} kun</span>
                <StatusBadge status={expiry.status} />
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default HRDashboard;
