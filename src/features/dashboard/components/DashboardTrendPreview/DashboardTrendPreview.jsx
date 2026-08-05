import { Link } from "react-router-dom";
import { ArrowRight, BarChart3 } from "lucide-react";
import { formatMoney } from "../../dashboardApi";
import "./DashboardTrendPreview.scss";

const DashboardTrendPreview = ({ metrics, currency }) => {
  const values = [
    { label: "Kecha", value: Number(metrics.yesterdaySales || 0) },
    { label: "Bugun", value: Number(metrics.todaySales || 0) },
  ].filter((item) => item.value > 0);

  if (values.length < 2) return null;

  const max = Math.max(...values.map((item) => item.value), 1);

  return (
    <section className="dashboard-trend-preview" aria-labelledby="dashboard-trend-title">
      <div className="dashboard-trend-preview__head">
        <div>
          <span>
            <BarChart3 size={14} aria-hidden="true" />
            Trend
          </span>
          <h2 id="dashboard-trend-title">Savdo ritmi</h2>
        </div>
        <Link to="/reports/sales">
          Hisobot
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="dashboard-trend-preview__bars" aria-label="Kecha va bugungi savdo taqqoslanishi">
        {values.map((item) => (
          <label key={item.label}>
            <span>{item.label}</span>
            <meter min="0" max={max} value={item.value}>
              {formatMoney(item.value, currency)}
            </meter>
            <strong>{formatMoney(item.value, currency)}</strong>
          </label>
        ))}
      </div>
    </section>
  );
};

export default DashboardTrendPreview;
