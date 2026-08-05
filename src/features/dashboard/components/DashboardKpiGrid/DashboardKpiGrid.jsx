import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./DashboardKpiGrid.scss";

const DashboardKpiGrid = ({ items = [], loading = false }) => {
  if (loading) {
    return (
      <section className="dashboard-kpi-grid" aria-label="KPI yuklanmoqda" aria-busy="true">
        {Array.from({ length: 4 }, (_, index) => (
          <article className="dashboard-kpi-card dashboard-kpi-card--loading" key={index} />
        ))}
      </section>
    );
  }

  return (
    <section className="dashboard-kpi-grid" aria-label="Asosiy biznes KPI">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            className={`dashboard-kpi-card dashboard-kpi-card--${item.tone || "neutral"}`}
            to={item.route}
            key={item.id}
            aria-label={`${item.title}: ${item.value}`}
          >
            <span className="dashboard-kpi-card__icon" aria-hidden="true">
              {Icon ? <Icon size={18} /> : null}
            </span>
            <span className="dashboard-kpi-card__copy">
              <span>{item.title}</span>
              <strong>{item.value}</strong>
            </span>
            <span className="dashboard-kpi-card__meta">
              <small>{item.meta}</small>
              <em>{item.status}</em>
            </span>
            <span className="dashboard-kpi-card__arrow" aria-hidden="true">
              <ArrowRight size={15} />
            </span>
          </Link>
        );
      })}
    </section>
  );
};

export default DashboardKpiGrid;
