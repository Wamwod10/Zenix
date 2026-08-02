import { Boxes } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../../dashboardApi";
import "./InventoryStatus.scss";

const InventoryStatus = ({ stats = {} }) => {
  const navigate = useNavigate();
  const total = Number(stats?.inventoryTotal ?? 0);
  const lowStock = Number(stats?.lowStockCount ?? 0);
  const outOfStock = Number(stats?.outOfStockCount ?? 0);
  const healthy = Math.max(total - lowStock - outOfStock, 0);
  const progress = total > 0 ? Math.round((healthy / total) * 100) : 0;

  return (
    <article className="zenix-dashboard__panel dashboard-widget dashboard-widget--blue inventory-status">
      <div className="zenix-dashboard__panel-head">
        <div className="zenix-dashboard__panel-title">
          <span>Ombor</span>
          <h3>Qoldiq holati</h3>
        </div>

        <span className="zenix-dashboard__panel-icon">
          <Boxes size={18} />
        </span>
      </div>

      <div className="dashboard-widget__body">
        <strong>{formatNumber(total)}</strong>
        <p>
          {total === 0
            ? "SKU ma'lumoti kelganda ombor holati ko'rinadi"
            : `${formatNumber(lowStock)} kam, ${formatNumber(outOfStock)} tugagan`}
        </p>
        <span
          className="dashboard-widget__meter"
          style={{ "--widget-progress": `${progress}%` }}
        >
          <i />
        </span>
        <button
          type="button"
          aria-label="Ombor qoldiqlarini ochish"
          title="Ombor qoldiqlarini ochish"
          onClick={() => navigate("/warehouse/stock")}
        >
          Qoldiqlarni ko'rish
        </button>
      </div>
    </article>
  );
};

export default InventoryStatus;
