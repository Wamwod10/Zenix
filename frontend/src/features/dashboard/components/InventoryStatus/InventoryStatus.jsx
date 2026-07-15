import { Boxes } from "lucide-react";
import "./InventoryStatus.scss";
// ✅ BACKEND INTEGRATION: ombor statistikasi (products/warehouse'dan)
import { useDashboardSummaryQuery } from "../../dashboardApi";

const InventoryStatus = () => {
  const { data } = useDashboardSummaryQuery();

  const total = data?.stats?.inventoryTotal ?? 0;
  const lowStock = data?.stats?.lowStockCount ?? 0;
  const progress = total > 0 ? Math.round(((total - lowStock) / total) * 100) : 0;

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
        <p>
          {total === 0
            ? "Mahsulot qo'shilganda ko'rinadi"
            : `${lowStock} ta mahsulot kam qolgan`}
        </p>
        <span
          className="dashboard-widget__meter"
          style={{ "--widget-progress": `${progress}%` }}
        >
          <i />
        </span>
      </div>
    </article>
  );
};

export default InventoryStatus;
