import {
  ArrowRight,
  Activity,
  CircleDollarSign,
  CreditCard,
  ListChecks,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatMoney, formatNumber, formatPercentChange } from "../../dashboardApi";
import "./SalesChart.scss";

const toHourlyData = (summary = {}, stats = {}) => {
  const source =
    summary?.salesByHour ||
    summary?.hourlySales ||
    summary?.analytics?.salesByHour ||
    stats?.salesByHour;

  if (!Array.isArray(source)) return [];

  return source
    .map((item) => ({
      label: item.label || item.hour || item.time || "",
      value: Number(item.sales ?? item.revenue ?? item.total ?? item.value ?? 0),
    }))
    .filter((item) => item.value >= 0);
};

const SalesChart = ({ currency = "uzs", stats = {}, summary }) => {
  const navigate = useNavigate();
  const hourlyData = toHourlyData(summary, stats);
  const salesChange = formatPercentChange(stats?.todaySales, stats?.yesterdaySales);

  const salesMetrics = [
    {
      label: "Tushum",
      value: formatMoney(stats?.todaySales, currency),
      change: salesChange?.label || "Kecha bilan taqqoslash yo'q",
      icon: CircleDollarSign,
    },
    {
      label: "Buyurtma",
      value: formatNumber(stats?.ordersToday ?? stats?.ordersTotal),
      change: "Bugungi amallar",
      icon: ShoppingBag,
    },
    {
      label: "Karta orqali to'lov",
      value:
        stats?.cardPaymentShare != null
          ? `${stats.cardPaymentShare}%`
          : "Ma'lumot yo'q",
      change: "To'lov turlari",
      icon: CreditCard,
    },
  ];

  return (
    <article className="zenix-dashboard__panel sales-chart">
      <div className="zenix-dashboard__panel-head">
        <div className="zenix-dashboard__panel-title">
          <span>
            <Activity size={14} />
            Savdo oqimi
          </span>
          <h3>Bugungi savdo qiymatlari</h3>
          <p>Soatlar bo'yicha tushum backenddan kelganda raqamli ko'rinishda chiqadi.</p>
        </div>

        <button
          className="sales-chart__report"
          type="button"
          aria-label="Savdo hisobotini ochish"
          title="Savdo hisobotini ochish"
          onClick={() => navigate("/reports/sales")}
        >
          Ochish
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="sales-chart__board">
        <div className="sales-chart__metrics">
          {salesMetrics.map((item) => {
            const Icon = item.icon;

            return (
              <div className="sales-chart__metric" key={item.label}>
                <span>
                  <Icon size={16} />
                </span>
                <div>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </div>
                <em>{item.change}</em>
              </div>
            );
          })}
        </div>

        {hourlyData.length ? (
          <div className="sales-chart__analysis" aria-label="Bugungi savdo qiymatlari">
            {hourlyData.slice(-12).map((item, index) => (
              <article key={`${item.label}-${index}`} title={`${item.label}: ${formatMoney(item.value, currency)}`}>
                <span>{item.label}</span>
                <strong>{formatMoney(item.value, currency)}</strong>
                <em>{index === hourlyData.slice(-12).length - 1 ? "So'nggi" : "Soat"}</em>
              </article>
            ))}
          </div>
        ) : (
          <div className="sales-chart__empty">
            <ListChecks size={18} />
            <strong>Soatlik savdo analitikasi hali ulanmagan</strong>
            <span>Real analytics qiymatlari kutilmoqda.</span>
          </div>
        )}
      </div>
    </article>
  );
};

export default SalesChart;
