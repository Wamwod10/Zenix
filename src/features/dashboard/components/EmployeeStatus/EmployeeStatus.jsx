import { UserCheck } from "lucide-react";
import "./EmployeeStatus.scss";

const EmployeeStatus = ({ employees }) => {
  const total = Number(employees?.total ?? 21);
  const active = Number(employees?.activeToday ?? 18);
  const progress = total > 0 ? Math.round((active / total) * 100) : 0;

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
        <strong>
          {active} / {total}
        </strong>
        <p>{Math.max(total - active, 0)} xodim bugun hali faol emas</p>
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

export default EmployeeStatus;
