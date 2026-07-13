import { UserCheck } from "lucide-react";
import "./EmployeeStatus.scss";
// ✅ BACKEND INTEGRATION: real jamoa soni (users jadvalidan)
import { useDashboardSummaryQuery } from "../../dashboardApi";

const EmployeeStatus = () => {
  const { data } = useDashboardSummaryQuery();

  const total = data?.employees?.total ?? 0;
  const activeToday = data?.employees?.activeToday ?? 0;
  const progress = total > 0 ? Math.round((activeToday / total) * 100) : 0;

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
          {activeToday} / {total}
        </strong>
        <p>Bugun faol xodimlar</p>
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
