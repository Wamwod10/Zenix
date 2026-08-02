import { useState } from "react";
import { CalendarDays, Clock, Edit3 } from "lucide-react";

import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatEmployeeName } from "../../utils/hrFormatters";

const Attendance = ({ controller }) => {
  const { state, dictionaries } = controller;
  const [reason, setReason] = useState("");
  const [view, setView] = useState("daily");

  return (
    <div className="hr-view">
      <section className="hr-panel">
        <div className="hr-panel__head">
          <div><span>Davomat</span><h2>Davomat va qo'lda tuzatish</h2></div>
          <div className="hr-actions-row">
            {["daily", "weekly", "monthly"].map((item) => (
              <button key={item} type="button" className={view === item ? "is-active" : ""} onClick={() => setView(item)}>
                <CalendarDays size={14} /> {item === "daily" ? "Kunlik" : item === "weekly" ? "Haftalik" : "Oylik"}
              </button>
            ))}
          </div>
        </div>
        <div className="hr-form-grid">
          <label className="hr-form-grid__wide">
            Tuzatish sababi
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Audit uchun sabab" />
          </label>
        </div>
        <div className="hr-table hr-table--attendance">
          {state.attendance.map((row) => (
            <article key={row.id}>
              <div>
                <strong>{formatEmployeeName(dictionaries.employeeById[row.employeeId])}</strong>
                <span>{row.date} - {row.method}</span>
                {row.correctionReason && <small>Tuzatish: {row.correctionReason}</small>}
              </div>
              <b>{row.checkIn || "--:--"}</b>
              <b>{row.checkOut || "--:--"}</b>
              <StatusBadge status={row.status} />
              <button
                type="button"
                disabled={!reason.trim()}
                onClick={() => controller.actions.correctAttendance(row.id, { status: "present", checkIn: row.checkIn || "09:00", checkOut: "18:00" }, reason)}
              >
                <Edit3 size={14} /> Tuzatish
              </button>
            </article>
          ))}
        </div>
        {!state.attendance.length && (
          <div className="hr-empty">
            <Clock size={16} /> Davomat yozuvlari topilmadi.
          </div>
        )}
      </section>
    </div>
  );
};

export default Attendance;
