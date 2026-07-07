import { Boxes } from "lucide-react";
import "./InventoryStatus.scss";

const InventoryStatus = () => {
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
        <strong>1 842</strong>
        <p>17 ta mahsulot kam qolgan</p>
        <span className="dashboard-widget__meter" style={{ "--widget-progress": "76%" }}>
          <i />
        </span>
      </div>
    </article>
  );
};

export default InventoryStatus;
