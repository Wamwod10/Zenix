import { Bell, CheckCircle2 } from "lucide-react";

import "./NotificationPanel.scss";

const NotificationPanel = ({ notifications, onOpen, onRead }) => (
  <article className="notification-panel">
    <div className="notification-panel__head">
      <span className="reports-eyebrow">
        <Bell size={14} />
        Notifications
      </span>
      <strong>{notifications.filter((item) => !item.read).length} unread</strong>
    </div>
    <div className="notification-panel__list">
      {notifications.map((item) => (
        <section className={`notification-panel__item is-${item.priority} ${item.read ? "is-read" : ""}`} key={item.id}>
          <div>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </div>
          <button type="button" onClick={() => onOpen(item.report)}>
            Ochish
          </button>
          <button type="button" aria-label="Mark notification read" onClick={() => onRead(item.id)}>
            <CheckCircle2 size={15} />
          </button>
        </section>
      ))}
    </div>
  </article>
);

export default NotificationPanel;
