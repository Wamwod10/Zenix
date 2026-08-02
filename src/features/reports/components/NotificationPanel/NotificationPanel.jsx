import { Bell, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";

import "./NotificationPanel.scss";

const NotificationPanel = ({ notifications, onOpen, onRead, onReadAll }) => {
  const [filter, setFilter] = useState("unread");
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => (
    notifications.filter((item) => {
      if (filter === "unread") return !item.read;
      if (filter === "urgent") return item.priority === "urgent" || item.priority === "high";
      return true;
    })
  ), [filter, notifications]);
  const pageSize = 4;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <article className="notification-panel">
      <div className="notification-panel__head">
        <span className="reports-eyebrow">
          <Bell size={14} />
          Bildirishnomalar
        </span>
        <strong>{notifications.filter((item) => !item.read).length} yangi</strong>
      </div>
      <div className="notification-panel__toolbar">
        {[
          ["unread", "Yangi"],
          ["urgent", "Muhim"],
          ["all", "Barchasi"],
        ].map(([id, label]) => (
          <button key={id} type="button" className={filter === id ? "is-active" : ""} onClick={() => { setFilter(id); setPage(0); }}>
            {label}
          </button>
        ))}
        <button type="button" onClick={onReadAll}>Hammasini o'qildi</button>
      </div>
      <div className="notification-panel__list">
        {pageItems.length ? pageItems.map((item) => (
          <section className={`notification-panel__item is-${item.priority} ${item.read ? "is-read" : ""}`} key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
            <button type="button" onClick={() => onOpen(item.report)}>
              Ochish
            </button>
            <button type="button" aria-label="Bildirishnomani o'qilgan qilish" title="O'qilgan qilish" onClick={() => onRead(item.id)}>
              <CheckCircle2 size={15} />
            </button>
          </section>
        )) : <p className="notification-panel__empty">Bildirishnoma yo'q.</p>}
      </div>
      <div className="notification-panel__pages">
        <button type="button" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>Oldingi</button>
        <span>{page + 1} / {pageCount}</span>
        <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>Keyingi</button>
      </div>
    </article>
  );
};

export default NotificationPanel;
