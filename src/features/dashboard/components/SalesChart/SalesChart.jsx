import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  CreditCard,
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
  const maxValue = Math.max(...hourlyData.map((item) => item.value), 1);
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
            <BarChart3 size={14} />
            Savdo oqimi
          </span>
          <h3>Bugungi savdo ritmi</h3>
          <p>Soatlar bo'yicha tushum backenddan kelganda real scale bilan chiziladi.</p>
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
          <div className="sales-chart__bars" aria-label="Bugungi savdo charti">
            {hourlyData.slice(-12).map((item, index) => {
              const level = Math.max(4, Math.round((item.value / maxValue) * 100));

              return (
                <span
                  className="sales-chart__bar"
                  key={`${item.label}-${index}`}
                  title={`${item.label}: ${formatMoney(item.value, currency)}`}
                  style={{
                    "--bar-height": `${level}%`,
                    "--bar-index": index,
                  }}
                >
                  <i />
                  <small>{item.label}</small>
                </span>
              );
            })}
          </div>
        ) : (
          <div className="sales-chart__empty">
            <BarChart3 size={18} />
            <strong>Soatlik savdo grafigi hali ulanmagan</strong>
            <span>Hardcoded barlar o'rniga real analytics kutilmoqda.</span>
          </div>
        )}
      </div>
    </article>
  );
};

export default SalesChart;
