import { BadgeCheck, CircleDollarSign, ShieldAlert, WalletCards } from "lucide-react";

import { FinanceBarChart, FinanceTrendChart } from "../../components/FinanceCharts/FinanceCharts";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatDate, formatMoney } from "../../utils/financeFormatters";

const FinanceAnalytics = ({ controller }) => {
  const trendRows = controller.state.transactions
    .filter((item) => item.status === "Posted")
    .slice()
    .reverse()
    .map((item) => ({
      label: formatDate(item.date),
      value: item.cashDirection === "out" ? -item.amount : item.amount,
    }));
  const debtRows = [
    { label: "Debitor", value: controller.summary.receivable },
    { label: "Muddati o'tgan", value: controller.summary.overdue },
    { label: "Kreditor", value: controller.summary.payable },
    { label: "Soliq", value: controller.summary.taxPayable },
  ];
  const summaryCards = [
    {
      icon: CircleDollarSign,
      label: "Sof foyda",
      value: formatMoney(controller.summary.netProfit),
      hint: "Daromad minus xarajatlar",
      tone: "is-net",
    },
    {
      icon: WalletCards,
      label: "Pul oqimi",
      value: formatMoney(controller.summary.cashFlow),
      hint: "Kirim va chiqim farqi",
      tone: "is-flow",
    },
    {
      icon: BadgeCheck,
      label: "Tasdiq kutayotgan tranzaksiyalar",
      value: controller.summary.pendingApprovals,
      hint: "Maker-checker navbatidagi yozuvlar",
      tone: "is-bank",
    },
    {
      icon: ShieldAlert,
      label: "Bank sverkasida moslanmagan yozuvlar",
      value: controller.summary.unreconciled,
      hint: "Tekshiruv talab qiladigan bank yozuvlari",
      tone: "is-expense",
    },
  ];

  return (
    <section className="finance-view">
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Moliyaviy analytics</span>
            <h2>Trend, risk va rentabellik</h2>
          </div>
          <StatusBadge status={controller.summary.healthScore > 70 ? "success" : "warning"} label={`${controller.summary.healthScore}/100`} />
        </div>
        <div className="finance-grid finance-grid--analytics">
          <FinanceTrendChart rows={trendRows} title="Pul oqimi trendi" />
          <FinanceBarChart rows={debtRows} title="Qarzdorlik va soliq taqsimoti" />
        </div>
      </section>
      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <span>Asosiy ko'rsatkichlar</span>
            <h2>Real state asosidagi KPI</h2>
          </div>
        </div>
        <div className="finance-card-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article className={`finance-mini-card finance-mini-card--metric ${card.tone}`} key={card.label}>
                <span className="finance-mini-card__icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="finance-mini-card__label">{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.hint}</small>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
};

export default FinanceAnalytics;
