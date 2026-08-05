import { Link } from "react-router-dom";
import { Activity, ArrowRight, FileClock } from "lucide-react";
import "./DashboardActivityCompact.scss";

const timeAgo = (value) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Vaqt yo'q";

  const minutes = Math.floor(Math.max(Date.now() - date.getTime(), 0) / 60000);
  if (minutes < 1) return "Hozirgina";
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.floor(hours / 24)} kun oldin`;
};

const moduleRoute = (moduleName = "") => {
  const module = String(moduleName).toLowerCase();
  if (module.includes("product")) return "/products";
  if (module.includes("warehouse")) return "/warehouse";
  if (module.includes("purchase")) return "/purchases";
  if (module.includes("supplier")) return "/suppliers";
  if (module.includes("finance")) return "/finance";
  if (module.includes("crm") || module.includes("customer")) return "/crm";
  if (module.includes("hr")) return "/hr";
  return "/reports/audit";
};

const DashboardActivityCompact = ({ items = [] }) => (
  <section className="dashboard-activity-compact" aria-labelledby="dashboard-activity-title">
    <div className="dashboard-activity-compact__head">
      <div>
        <span>Audit</span>
        <h2 id="dashboard-activity-title">Oxirgi faoliyat</h2>
      </div>
      <Link to="/reports/audit">
        Barchasi
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>

    {items.length ? (
      <div className="dashboard-activity-compact__list">
        {items.slice(0, 6).map((item, index) => (
          <Link
            className="dashboard-activity-compact__item"
            to={moduleRoute(item.module)}
            key={item.id || `${item.action}-${index}`}
          >
            <span aria-hidden="true">
              <Activity size={15} />
            </span>
            <span>
              <strong>{item.action || "Tizim amali bajarildi"}</strong>
              <small>
                {item.module || "core"} · {timeAgo(item.createdAt || item.timestamp || item.at)}
              </small>
            </span>
          </Link>
        ))}
      </div>
    ) : (
      <div className="dashboard-activity-compact__empty" role="status">
        <FileClock size={17} aria-hidden="true" />
        <span>Hozircha audit faoliyati yo'q. Amallar bajarilganda ro'yxat to'ladi.</span>
      </div>
    )}
  </section>
);

export default DashboardActivityCompact;
