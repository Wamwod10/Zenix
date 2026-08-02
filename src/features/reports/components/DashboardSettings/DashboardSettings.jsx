import { Eye, EyeOff, PanelTopOpen } from "lucide-react";

import "./DashboardSettings.scss";

const DashboardSettings = ({ widgets, onWidgetAction, backendPayload }) => (
  <article className="dashboard-settings">
    <div className="dashboard-settings__head">
      <span className="reports-eyebrow">
        <PanelTopOpen size={14} />
        Dashboard sozlamalari
      </span>
      <strong>{widgets.filter((item) => item.visible).length} ko'rinadi</strong>
    </div>
    <div className="dashboard-settings__list">
      {widgets.map((widget) => (
        <section key={widget.id}>
          <div>
            <strong>{widget.title}</strong>
            <small>{widget.type} · {widget.size}</small>
          </div>
          <button type="button" onClick={() => onWidgetAction(widget.id, widget.visible ? "hide" : "refresh")}>
            {widget.visible ? <EyeOff size={15} /> : <Eye size={15} />}
            {widget.visible ? "Yashirish" : "Ko'rsatish"}
          </button>
          <button type="button" onClick={() => onWidgetAction(widget.id, "move")}>Yuqoriga</button>
          <button type="button" onClick={() => onWidgetAction(widget.id, "resize")}>O'lcham</button>
          <button type="button" onClick={() => onWidgetAction(widget.id, "refresh")}>Yangilash</button>
          <button type="button" onClick={() => onWidgetAction(widget.id, "settings")}>
            Sozlash
          </button>
        </section>
      ))}
    </div>
    <details>
      <summary>Backend adapter payload</summary>
      <pre>{JSON.stringify(backendPayload, null, 2)}</pre>
    </details>
  </article>
);

export default DashboardSettings;
