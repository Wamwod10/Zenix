import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { calculateLeaveBalance } from "../../utils/hrCalculations";
import { formatEmployeeName } from "../../utils/hrFormatters";

const LeaveManagement = ({ controller }) => {
  const { state, dictionaries } = controller;

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head"><div><span>Leave</span><h2>Ta'til va employee requests</h2></div></div>
        <div className="hr-table hr-table--leave">
          {state.leaves.map((leave) => (
            <article key={leave.id}>
              <div>
                <strong>{formatEmployeeName(dictionaries.employeeById[leave.employeeId])}</strong>
                <span>{leave.type} · {leave.from} - {leave.to}</span>
              </div>
              <b>{leave.days} kun</b>
              <b>Balance {calculateLeaveBalance(state.leaves, leave.employeeId)}</b>
              <StatusBadge status={leave.status} />
              <div className="hr-actions-row">
                <button type="button" onClick={() => controller.actions.approveLeave(leave.id, "Approved")}>Approve</button>
                <button type="button" onClick={() => controller.actions.approveLeave(leave.id, "Rejected")}>Reject</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LeaveManagement;
