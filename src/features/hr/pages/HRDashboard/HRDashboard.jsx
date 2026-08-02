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
import { calculateDocumentExpiry, calculateProbationDays, isBirthdayWithinDays } from "../../utils/hrCalculations";
import { formatDate, formatMoney, formatEmployeeName } from "../../utils/hrFormatters";

const insightRank = { danger: 0, warning: 1, info: 2, success: 3 };

const HRDashboard = ({ controller, onNavigate }) => {
  const { state, summary, aiInsights, dictionaries } = controller;
  const birthdays = state.employees.filter((employee) => isBirthdayWithinDays(employee.birthDate, 7, summary.currentDate));
  const probation = state.employees.filter((employee) =>
    ["ending-soon", "decision-pending", "active"].includes(employee.probation?.status) &&
    calculateProbationDays(employee.probation).remaining <= 30,
  );
  const sortedInsights = [...aiInsights].sort((a, b) => (insightRank[a.tone] ?? 9) - (insightRank[b.tone] ?? 9));
  const documentRisks = state.employees.flatMap((employee) =>
    employee.documents
      .map((document) => ({ employee, document, expiry: calculateDocumentExpiry(document) }))
      .filter((item) => ["warning", "critical", "expired"].includes(item.expiry.status)),
  );

  const cards = [
    { label: "Jami faol xodimlar", value: summary.totalActive, meta: "Barcha filiallar", icon: Users, view: "employees" },
    { label: "Bugun ishda", value: summary.todayPresent, meta: `${summary.attendanceRate}% davomat`, icon: UserCheck, tone: "green", view: "attendance" },
    { label: "Ta'tilda / kasal", value: `${summary.leavesToday}/${summary.sickToday}`, meta: "Bugungi holat", icon: CalendarCheck, tone: "orange", view: "leaves" },
    { label: "Kechikkanlar", value: summary.lateToday, meta: "Tuzatish auditi bilan", icon: AlertTriangle, tone: "red", view: "attendance" },
    { label: "Yangi / bo'shagan", value: `${summary.newHires}/${summary.terminated}`, meta: summary.currentPeriod, icon: UserMinus, view: "employees" },
    { label: "Oylik fondi", value: formatMoney(summary.payrollFund), meta: "Bonus va ushlanmalar bilan", icon: Banknote, view: "payroll" },
    { label: "Tasdiq kutilmoqda", value: summary.pendingApprovals, meta: "Ta'til, oylik, hujjat", icon: FileWarning, tone: "orange", view: "reports" },
    { label: "Ochiq vakansiyalar", value: summary.openVacancies, meta: "Ishga olish jarayoni", icon: Sparkles, view: "recruitment" },
  ];

  return (
    <div className="hr-view">
      <section className="hr-kpi-grid">
        {cards.map((card, index) => (
          <HRKpiCard key={card.label} {...card} index={index} onClick={() => onNavigate(card.view)} />
        ))}
      </section>

      <section className="hr-grid hr-grid--wide">
        <article className="hr-panel">
          <div className="hr-panel__head">
            <div>
              <span>AI HR tavsiyalar</span>
              <h2>Inson qarori uchun tavsiyalar</h2>
            </div>
            <StatusBadge status="warning" label={`${aiInsights.length} tavsiya`} />
          </div>
          <div className="hr-list">
            {sortedInsights.slice(0, 5).map((insight) => (
              <article key={insight.id}>
                <strong>{insight.title}</strong>
                <span>{insight.message}</span>
                <div className="hr-actions-row">
                  <button type="button" onClick={() => controller.actions.runAiAction(insight, insight.action)}>
                    {insight.action}
                  </button>
                  <button type="button" onClick={() => controller.actions.addNotification("AI tavsiya keyinga qoldirildi.", "warning")}>
                    Keyinga qoldirish
                  </button>
                </div>
              </article>
            ))}
            {!sortedInsights.length && <div className="hr-empty">Hozircha xavfli tavsiya yo'q.</div>}
          </div>
        </article>

        <article className="hr-panel">
          <div className="hr-panel__head">
            <div>
              <span>Tug'ilgan kunlar</span>
              <h2>Bugun va 7 kun ichida</h2>
            </div>
            <Cake size={20} />
          </div>
          <div className="hr-list">
            {birthdays.map((employee) => (
              <article key={employee.id}>
                <strong>{formatEmployeeName(employee)}</strong>
                <span>{formatDate(employee.birthDate)} - {dictionaries.branchById[employee.branchId]?.name}</span>
                <small>{state.birthdayGreetings.some((item) => item.employeeId === employee.id) ? "Tabrik yuborilgan" : "Tabrik yuborilmagan"}</small>
                <button type="button" onClick={() => controller.actions.greetBirthday(employee.id)}>
                  Tabriklash
                </button>
              </article>
            ))}
            {!birthdays.length && <div className="hr-empty">Yaqin 7 kunda tug'ilgan kun yo'q.</div>}
          </div>
        </article>
      </section>

      <section className="hr-grid">
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Davomat trendi</span><h2>Kunlik ko'rsatkichlar</h2></div></div>
          <div className="hr-chart-bars">
            {state.attendance.map((row) => (
              <span key={row.id} style={{ "--value": ["present", "remote"].includes(row.status) ? "92%" : row.status === "late" ? "68%" : "36%" }}>
                <b>{row.date.slice(5)}</b>
              </span>
            ))}
          </div>
        </article>
        <article className="hr-panel">
          <div className="hr-panel__head"><div><span>Filiallar</span><h2>Xodimlar taqsimoti</h2></div></div>
          <div className="hr-chart-bars">
            {state.branches.map((branch) => (
              <span key={branch.id} style={{ "--value": `${Math.min(branch.employeeCount * 2, 100)}%` }}>
                <b>{branch.city}</b>
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="hr-grid">
        <article className="hr-panel">
          <div className="hr-panel__head">
            <div>
              <span>Sinov muddati</span>
              <h2>Qaror talab qiladigan xodimlar</h2>
            </div>
          </div>
          <div className="hr-list">
            {probation.map((employee) => {
              const meta = calculateProbationDays(employee.probation);
              return (
                <article key={employee.id}>
                  <strong>{formatEmployeeName(employee)}</strong>
                  <span>{meta.remaining} kun qoldi - progress {meta.progress}%</span>
                  <meter min="0" max="100" value={meta.progress} />
                </article>
              );
            })}
            {!probation.length && <div className="hr-empty">Yaqin 30 kunda sinov muddati xavfi yo'q.</div>}
          </div>
        </article>

        <article className="hr-panel">
          <div className="hr-panel__head">
            <div>
              <span>Hujjat muddati</span>
              <h2>Muddati yaqin hujjatlar</h2>
            </div>
          </div>
          <div className="hr-list">
            {documentRisks.slice(0, 6).map(({ employee, document, expiry }) => (
              <article key={`${employee.id}-${document.id}`}>
                <strong>{formatEmployeeName(employee)} - {document.type}</strong>
                <span>{formatDate(document.expiryDate)} - {expiry.remaining} kun</span>
                <StatusBadge status={expiry.status} />
              </article>
            ))}
            {documentRisks.length > 6 && <button type="button" onClick={() => onNavigate("reports")}>Barchasini ko'rish</button>}
            {!documentRisks.length && <div className="hr-empty">Hujjat xavfi topilmadi.</div>}
          </div>
        </article>
      </section>
    </div>
  );
};

export default HRDashboard;
