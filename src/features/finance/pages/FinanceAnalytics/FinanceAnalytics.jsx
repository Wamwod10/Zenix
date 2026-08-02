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
        <div className="finance-grid">
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
          <article className="finance-mini-card"><strong>{formatMoney(controller.summary.netProfit)}</strong><span>Sof foyda</span></article>
          <article className="finance-mini-card"><strong>{formatMoney(controller.summary.cashFlow)}</strong><span>Pul oqimi</span></article>
          <article className="finance-mini-card"><strong>{controller.summary.pendingApprovals}</strong><span>Tasdiq kutayotgan tranzaksiyalar</span></article>
          <article className="finance-mini-card"><strong>{controller.summary.unreconciled}</strong><span>Bank sverkasida moslanmagan yozuvlar</span></article>
        </div>
      </section>
    </section>
  );
};

export default FinanceAnalytics;
