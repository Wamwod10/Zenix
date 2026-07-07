import { Zap } from "lucide-react";
import "./QuickActions.scss";

const QuickActions = () => {
  return (
    <article className="zenix-dashboard__panel dashboard-widget dashboard-widget--gold quick-actions">
      <div className="zenix-dashboard__panel-head">
        <div className="zenix-dashboard__panel-title">
          <span>Tezkor</span>
          <h3>Action queue</h3>
        </div>

        <span className="zenix-dashboard__panel-icon">
          <Zap size={18} />
        </span>
      </div>

      <div className="dashboard-widget__body">
        <strong>7 ta</strong>
        <p>2 tasi bugun yopiladi</p>
        <span className="dashboard-widget__meter" style={{ "--widget-progress": "62%" }}>
          <i />
        </span>
      </div>
    </article>
  );
};

export default QuickActions;
