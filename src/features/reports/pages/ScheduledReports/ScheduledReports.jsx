import { Pause, Play, Trash2 } from "lucide-react";
import { useState } from "react";

import ReportsField from "../../components/ReportsField/ReportsField";
import { getValueLabel } from "../../utils/reportsFormatters";
import "./ScheduledReports.scss";

const initialForm = {
  name: "Oylik moliyaviy paket",
  report: "Moliya sharhi",
  frequency: "monthly",
  time: "08:00",
  channel: "email",
  recipients: "ceo@zenix.local",
  timezone: "Asia/Tashkent",
  weekdays: "Dushanba",
};

const ScheduledReports = ({ controller }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Nom majburiy";
    if (!form.report) nextErrors.report = "Hisobot tanlang";
    if (!form.time) nextErrors.time = "Vaqt tanlang";
    if (!form.channel) nextErrors.channel = "Kanal tanlang";
    if (!form.recipients.trim()) nextErrors.recipients = "Qabul qiluvchi majburiy";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    controller.actions.createSchedule({ ...form, nextRun: `${form.time}, ${getValueLabel(form.frequency)}` });
  };

  return (
    <section className="scheduled-reports">
      <div className="reports-simple-view__head">
        <span className="reports-eyebrow">Rejalashtirilgan hisobotlar</span>
        <h2>Avtomatik yuborish markazi</h2>
      </div>
      <form className="scheduled-reports__form">
        <ReportsField label="Nomi" value={form.name} onChange={(value) => update("name", value)} error={errors.name} />
        <ReportsField label="Hisobot" type="select" value={form.report} onChange={(value) => update("report", value)} error={errors.report} options={["Savdo samaradorligi", "Moliya sharhi", "Ombor tahlili", "Rahbar hisoboti", "HR sharhi"]} />
        <ReportsField label="Takrorlanish" type="select" value={form.frequency} onChange={(value) => update("frequency", value)} options={[
          { value: "daily", label: "Har kuni" },
          { value: "weekly", label: "Har hafta" },
          { value: "monthly", label: "Har oy" },
          { value: "quarterly", label: "Har kvartal" },
          { value: "yearly", label: "Har yil" },
          { value: "custom", label: "Maxsus" },
        ]} />
        <ReportsField label="Yuborish vaqti" type="time" value={form.time} onChange={(value) => update("time", value)} error={errors.time} />
        <ReportsField label="Kanal" type="select" value={form.channel} onChange={(value) => update("channel", value)} error={errors.channel} options={["email", "Telegram", "ZENIX notification"]} />
        <ReportsField label="Qabul qiluvchilar" value={form.recipients} onChange={(value) => update("recipients", value)} error={errors.recipients} />
        <ReportsField label="Timezone" type="select" value={form.timezone} onChange={(value) => update("timezone", value)} options={["Asia/Tashkent", "UTC", "Asia/Samarkand"]} />
        {form.frequency === "custom" && (
          <ReportsField label="Maxsus kunlar" value={form.weekdays} onChange={(value) => update("weekdays", value)} />
        )}
        <button type="button" onClick={submit}>Schedule yaratish</button>
      </form>
      <div className="scheduled-reports__list">
        {controller.state.scheduledReports.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.report} / {getValueLabel(item.frequency)} / {item.time} / {item.channel}</span>
              <small>Keyingi yuborilish: {item.nextRun || `${item.time}, ${getValueLabel(item.frequency)}`} / Oxirgi natija: muvaffaqiyatli</small>
            </div>
            <button type="button" onClick={() => controller.actions.updateSchedule(item.id, { status: item.status === "active" ? "paused" : "active" })}>
              {item.status === "active" ? <Pause size={15} /> : <Play size={15} />}
              {getValueLabel(item.status)}
            </button>
            <button
              type="button"
              aria-label="Schedule o'chirish"
              title="Schedule o'chirish"
              onClick={() => {
                if (window.confirm("Bu schedule o'chirilsinmi?")) controller.actions.deleteSchedule(item.id);
              }}
            >
              <Trash2 size={15} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ScheduledReports;
