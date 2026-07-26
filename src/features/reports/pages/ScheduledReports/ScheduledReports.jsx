import { Pause, Play, Trash2 } from "lucide-react";
import { useState } from "react";

import "./ScheduledReports.scss";

const ScheduledReports = ({ controller }) => {
  const [form, setForm] = useState({
    name: "Monthly finance board pack",
    report: "Finance Overview",
    frequency: "monthly",
    time: "08:00",
    channel: "email",
  });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <section className="scheduled-reports">
      <div className="reports-simple-view__head">
        <span className="reports-eyebrow">Scheduled Reports</span>
        <h2>Automation center</h2>
      </div>
      <form className="scheduled-reports__form">
        {[
          ["name", "text", []],
          ["report", "select", ["Sales Performance", "Finance Overview", "Warehouse Analysis", "Executive Report", "HR Overview"]],
          ["frequency", "select", ["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]],
          ["time", "time", []],
          ["channel", "select", ["email", "Telegram", "ZENIX notification"]],
        ].map(([key, type, options]) => (
          <label key={key}>
            <span>{key}</span>
            {type === "select" ? (
              <select value={form[key]} onChange={(event) => update(key, event.target.value)}>
                {options.map((item) => <option key={item}>{item}</option>)}
              </select>
            ) : (
              <input type={type} value={form[key]} onChange={(event) => update(key, event.target.value)} />
            )}
          </label>
        ))}
        <button type="button" onClick={() => controller.actions.createSchedule(form)}>Create schedule</button>
      </form>
      <div className="scheduled-reports__list">
        {controller.state.scheduledReports.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.report} · {item.frequency} · {item.time} · {item.channel}</span>
            </div>
            <button type="button" onClick={() => controller.actions.updateSchedule(item.id, { status: item.status === "active" ? "paused" : "active" })}>
              {item.status === "active" ? <Pause size={15} /> : <Play size={15} />}
              {item.status}
            </button>
            <button type="button" aria-label="Delete schedule" onClick={() => controller.actions.deleteSchedule(item.id)}>
              <Trash2 size={15} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ScheduledReports;
