import { UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../../dashboardApi";
import "./EmployeeStatus.scss";

const EmployeeStatus = ({ employees }) => {
  const navigate = useNavigate();
  const hasEmployeeData = employees?.total != null || employees?.activeToday != null;
  const total = Number(employees?.total ?? 0);
  const active = Number(employees?.activeToday ?? 0);
  const inactive = Math.max(total - active, 0);

  return (
    <article className="zenix-dashboard__panel dashboard-widget dashboard-widget--green employee-status">
      <div className="zenix-dashboard__panel-head">
        <div className="zenix-dashboard__panel-title">
          <span>Jamoa</span>
          <h3>Smena holati</h3>
        </div>

        <span className="zenix-dashboard__panel-icon">
          <UserCheck size={18} />
        </span>
      </div>

      <div className="dashboard-widget__body">
        <strong>
          {hasEmployeeData
            ? `${formatNumber(active)} / ${formatNumber(total)}`
            : "Ma'lumot yo'q"}
        </strong>
        <p>
          {hasEmployeeData
            ? `${formatNumber(inactive)} xodim bugun hali faol emas`
            : "Smena va davomat endpointi ulanganda ko'rinadi"}
        </p>
        <span className="dashboard-widget__split">
          <b>{formatNumber(active)}</b>
          <small>Bugun faol</small>
        </span>
        <button
          type="button"
          aria-label="Smena sahifasini ochish"
          title="Smena sahifasini ochish"
          onClick={() => navigate("/hr/shifts")}
        >
          Smenalarni ko'rish
        </button>
      </div>
    </article>
  );
};

export default EmployeeStatus;
