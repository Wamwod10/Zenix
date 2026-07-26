import { useState } from "react";
import { Clock, Edit3 } from "lucide-react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatEmployeeName } from "../../utils/hrFormatters";

const Attendance = ({ controller }) => {
  const { state, dictionaries } = controller;
  const [reason, setReason] = useState("");

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head">
          <div><span>Attendance</span><h2>Davomat va manual correction</h2></div>
          <Clock size={20} />
        </div>
        <div className="hr-form-grid">
          <label className="hr-form-grid__wide">Correction reason<textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Audit uchun sabab" /></label>
        </div>
        <div className="hr-table hr-table--attendance">
          {state.attendance.map((row) => (
            <article key={row.id}>
              <div>
                <strong>{formatEmployeeName(dictionaries.employeeById[row.employeeId])}</strong>
                <span>{row.date} · {row.method}</span>
              </div>
              <b>{row.checkIn || "--:--"}</b>
              <b>{row.checkOut || "--:--"}</b>
              <StatusBadge status={row.status} />
              <button type="button" onClick={() => controller.actions.correctAttendance(row.id, { status: "present", checkIn: row.checkIn || "09:00", checkOut: "18:00" }, reason)}>
                <Edit3 size={14} /> Correct
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Attendance;
