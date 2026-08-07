import { Link } from "react-router-dom";
import { Activity, ArrowRight } from "lucide-react";
import { formatMoney } from "../../dashboardApi";
import "./DashboardTrendPreview.scss";

const DashboardTrendPreview = ({ metrics, currency }) => {
  const values = [
    { label: "Kecha", value: Number(metrics.yesterdaySales || 0) },
    { label: "Bugun", value: Number(metrics.todaySales || 0) },
  ].filter((item) => item.value > 0);

  if (values.length < 2) return null;

  return (
    <section className="dashboard-trend-preview" aria-labelledby="dashboard-trend-title">
      <div className="dashboard-trend-preview__head">
        <div>
          <span>
            <Activity size={14} aria-hidden="true" />
            Taqqoslash
          </span>
          <h2 id="dashboard-trend-title">Savdo ritmi</h2>
        </div>
        <Link to="/reports/sales">
          Hisobot
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="dashboard-trend-preview__values" aria-label="Kecha va bugungi savdo taqqoslanishi">
        {values.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{formatMoney(item.value, currency)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DashboardTrendPreview;
