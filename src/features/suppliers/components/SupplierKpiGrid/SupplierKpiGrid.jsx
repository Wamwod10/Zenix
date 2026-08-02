import { ArrowDownRight, ArrowUpRight, Archive, ShieldAlert, Star, Users } from "lucide-react";

import "./SupplierKpiGrid.scss";

const ICONS = {
  all: Users,
  active: Users,
  blocked: ShieldAlert,
  archived: Archive,
  rating: Star,
};

const SupplierKpiGrid = ({ items = [], activeId = "all", onSelect }) => (
  <section className="supplier-kpi-grid" aria-label="Yetkazib beruvchilar KPI">
    {items.map((item, index) => {
      const Icon = ICONS[item.id] || Users;
      const TrendIcon = item.trend === "down" ? ArrowDownRight : ArrowUpRight;
      const active = activeId === item.id || (item.id === "all" && activeId === "custom");

      return (
        <button
          type="button"
          key={item.id}
          className={[
            "supplier-kpi-card",
            `supplier-kpi-card--${item.tone}`,
            active ? "supplier-kpi-card--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ "--card-index": index }}
          aria-pressed={active}
          onClick={() => onSelect?.(item.id)}
        >
          <span className="supplier-kpi-card__icon">
            <Icon size={20} />
          </span>
          <span className="supplier-kpi-card__body">
            <span className="supplier-kpi-card__title">{item.title}</span>
            <strong>{item.value}</strong>
            <span className="supplier-kpi-card__meta">
              <span className={`supplier-kpi-card__trend supplier-kpi-card__trend--${item.trend}`}>
                <TrendIcon size={14} />
                {item.change}
              </span>
              <small>{item.previous}</small>
            </span>
          </span>
        </button>
      );
    })}
  </section>
);

export default SupplierKpiGrid;

