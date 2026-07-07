import { UserCheck } from "lucide-react";
import "./EmployeeStatus.scss";

const EmployeeStatus = () => {
  return (
    <article className="zenix-dashboard__panel dashboard-widget dashboard-widget--green employee-status">
      <div className="zenix-dashboard__panel-head">
        <div className="zenix-dashboard__panel-title">
          <span>Jamoa</span>
          <h3>Smena ritmi</h3>
        </div>

        <span className="zenix-dashboard__panel-icon">
          <UserCheck size={18} />
        </span>
      </div>

      <div className="dashboard-widget__body">
        <strong>18 / 21</strong>
        <p>3 xodim tanaffusda</p>
        <span className="dashboard-widget__meter" style={{ "--widget-progress": "86%" }}>
          <i />
        </span>
      </div>
    </article>
  );
};

export default EmployeeStatus;
