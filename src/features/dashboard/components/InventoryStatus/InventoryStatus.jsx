import { Boxes } from "lucide-react";
import "./InventoryStatus.scss";

const InventoryStatus = ({ stats }) => {
  const total = Number(stats?.inventoryTotal ?? 1842);
  const lowStock = Number(stats?.lowStockCount ?? 17);
  const progress = total > 0 ? Math.max(8, Math.min(96, 100 - (lowStock / total) * 100)) : 0;

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
        <strong>{total.toLocaleString("ru-RU")}</strong>
        <p>{lowStock} ta mahsulot kam qolgan</p>
        <span className="dashboard-widget__meter" style={{ "--widget-progress": `${progress}%` }}>
          <i />
        </span>
      </div>
    </article>
  );
};

export default InventoryStatus;
