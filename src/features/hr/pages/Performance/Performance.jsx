import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatEmployeeName } from "../../utils/hrFormatters";

const Performance = ({ controller }) => {
  const { state, dictionaries } = controller;

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head"><div><span>Performance</span><h2>KPI, reviews, goals va promotion</h2></div></div>
        <div className="hr-card-grid">
          {state.performance.map((item) => (
            <article className="hr-mini-card" key={item.id}>
              <strong>{formatEmployeeName(dictionaries.employeeById[item.employeeId])}</strong>
              <span>Attendance {item.attendance}% · Tasks {item.taskCompletion}%</span>
              <span>Sales {item.sales} · Goal {item.goalProgress}%</span>
              <b>Efficiency {item.efficiency}%</b>
              <StatusBadge status={item.trend === "up" ? "active" : "warning"} label={item.review} />
              <button type="button" onClick={() => controller.actions.addNotification("Manager review started.")}>Start review</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Performance;
