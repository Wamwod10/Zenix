import "./RevenueChart.scss";
import { BarChart3, CalendarDays, CircleDollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatMoney, formatNumber, formatPercentChange } from "../../dashboardApi";

const toTrendData = (stats = {}) => {
  const trend = stats.revenueTrend || stats.salesTrend || stats.dailySalesTrend;

  if (Array.isArray(trend) && trend.length) {
    return trend
      .map((item) => ({
        label: item.label || item.date || item.day || "",
        value: Number(item.revenue ?? item.sales ?? item.total ?? item.value ?? 0),
      }))
      .filter((item) => item.value >= 0);
  }

  const yesterday = Number(stats.yesterdaySales ?? 0);
  const today = Number(stats.todaySales ?? 0);

  if (yesterday || today) {
    return [
      { label: "Kecha", value: yesterday },
      { label: "Bugun", value: today },
    ];
  }

  return [];
};

const RevenueChart = ({ currency = "uzs", stats = {} }) => {
  const navigate = useNavigate();
  const trendData = toTrendData(stats);
  const maxValue = Math.max(...trendData.map((item) => item.value), 1);
  const salesChange = formatPercentChange(stats?.todaySales, stats?.yesterdaySales);
  const totalRevenue = trendData.reduce((sum, item) => sum + item.value, 0);

  return (
    <article className="zenix-dashboard__panel revenue-panel">
      <div className="zenix-dashboard__panel-head">
        <div className="zenix-dashboard__panel-title">
          <span>
            <CircleDollarSign size={14} />
            Daromad nazorati
          </span>
          <h3>Savdo va foyda trendi</h3>
          <p>Real summary asosida bugungi tushum va yaqin davr dinamikasi.</p>
        </div>

        <button
          className="revenue-panel__report"
          type="button"
          aria-label="Savdo hisobotini ochish"
          title="Savdo hisobotini ochish"
          onClick={() => navigate("/reports/sales")}
        >
          <CalendarDays size={15} />
          Hisobot
        </button>
      </div>

      <div className="revenue-panel__summary">
        <div>
          <small>Bugungi tushum</small>
          <strong>{formatMoney(stats?.todaySales, currency)}</strong>
          <span>{salesChange?.label || "Taqqoslash uchun kechagi savdo yo'q"}</span>
        </div>
        <div>
          <small>Sof foyda</small>
          <strong>{formatMoney(stats?.netProfit, currency)}</strong>
          <span>{stats?.profitMargin != null ? `${stats.profitMargin}% marja` : "Marja yo'q"}</span>
        </div>
        <div>
          <small>Buyurtmalar</small>
          <strong>{formatNumber(stats?.ordersToday ?? stats?.ordersTotal)}</strong>
          <span>Bugungi savdo oqimi</span>
        </div>
      </div>

      {trendData.length ? (
        <div className="revenue-panel__chart" aria-label="Daromad trendi">
          {trendData.slice(-12).map((item, index) => {
            const level = Math.max(4, Math.round((item.value / maxValue) * 100));

            return (
              <span
                className="revenue-panel__bar"
                key={`${item.label}-${index}`}
                title={`${item.label}: ${formatMoney(item.value, currency)}`}
                style={{ "--bar-level": `${level}%`, "--bar-index": index }}
              >
                <i />
                <small>{item.label}</small>
              </span>
            );
          })}
        </div>
      ) : (
        <div className="revenue-panel__empty">
          <BarChart3 size={18} />
          <strong>Trend uchun real savdo ma'lumoti hali yo'q</strong>
          <span>POS savdolari yig'ilgach chart avtomatik to'ladi.</span>
        </div>
      )}

      <p className="revenue-panel__note">
        {totalRevenue
          ? `Ko'rinayotgan davr tushumi: ${formatMoney(totalRevenue, currency)}.`
          : "Demo signal ko'rsatilmaydi; panel faqat real summary qiymatlariga tayangan."}
      </p>
    </article>
  );
};

export default RevenueChart;
