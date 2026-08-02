import { useState } from "react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { calculateLeaveBalance } from "../../utils/hrCalculations";
import { formatEmployeeName } from "../../utils/hrFormatters";

const LeaveManagement = ({ controller }) => {
  const { state, dictionaries } = controller;
  const [comment, setComment] = useState("");

  const decide = (leaveId, status) => {
    const label = status === "Approved" ? "tasdiqlash" : "rad etish";
    if (!window.confirm(`Ta'til so'rovini ${label}ni tasdiqlaysizmi?`)) return;
    controller.actions.approveLeave(leaveId, status, comment);
  };

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head"><div><span>Ta'til</span><h2>Ta'til va xodim so'rovlari</h2></div></div>
        <div className="hr-form-grid">
          <label className="hr-form-grid__wide">
            Qaror izohi
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Tasdiqlash yoki rad etish sababi" />
          </label>
        </div>
        <div className="hr-table hr-table--leave">
          {state.leaves.map((leave) => (
            <article key={leave.id}>
              <div>
                <strong>{formatEmployeeName(dictionaries.employeeById[leave.employeeId])}</strong>
                <span>{leave.type} - {leave.from} - {leave.to}</span>
                {leave.decisionComment && <small>Izoh: {leave.decisionComment}</small>}
              </div>
              <b>{leave.days} kun</b>
              <b>Qoldiq {calculateLeaveBalance(state.leaves, leave.employeeId)}</b>
              <StatusBadge status={leave.status} />
              <div className="hr-actions-row">
                <button type="button" disabled={!comment.trim() || leave.status !== "Pending"} onClick={() => decide(leave.id, "Approved")}>Tasdiqlash</button>
                <button type="button" disabled={!comment.trim() || leave.status !== "Pending"} onClick={() => decide(leave.id, "Rejected")}>Rad etish</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LeaveManagement;
