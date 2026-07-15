import { UserCheck } from "lucide-react";
import "./EmployeeStatus.scss";
// ✅ BACKEND INTEGRATION: real jamoa soni (users jadvalidan)
import { useDashboardSummaryQuery } from "../../dashboardApi";

<<<<<<< HEAD:src/features/dashboard/components/EmployeeStatus/EmployeeStatus.jsx
const EmployeeStatus = ({ employees }) => {
  const total = Number(employees?.total ?? 21);
  const active = Number(employees?.activeToday ?? 18);
  const progress = total > 0 ? Math.round((active / total) * 100) : 0;
=======
const EmployeeStatus = () => {
  const { data } = useDashboardSummaryQuery();

  const total = data?.employees?.total ?? 0;
  const activeToday = data?.employees?.activeToday ?? 0;
  const progress = total > 0 ? Math.round((activeToday / total) * 100) : 0;
>>>>>>> d6b99a90462b6f5577d34dbe8eb51623ebd2e0a4:frontend/src/features/dashboard/components/EmployeeStatus/EmployeeStatus.jsx

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
<<<<<<< HEAD:src/features/dashboard/components/EmployeeStatus/EmployeeStatus.jsx
          {active} / {total}
        </strong>
        <p>{Math.max(total - active, 0)} xodim bugun hali faol emas</p>
        <span className="dashboard-widget__meter" style={{ "--widget-progress": `${progress}%` }}>
=======
          {activeToday} / {total}
        </strong>
        <p>Bugun faol xodimlar</p>
        <span
          className="dashboard-widget__meter"
          style={{ "--widget-progress": `${progress}%` }}
        >
>>>>>>> d6b99a90462b6f5577d34dbe8eb51623ebd2e0a4:frontend/src/features/dashboard/components/EmployeeStatus/EmployeeStatus.jsx
          <i />
        </span>
      </div>
    </article>
  );
};

export default EmployeeStatus;
