import { X } from "lucide-react";

import "./POSNotifications.scss";

const POSNotifications = ({ notifications = [], onDismiss }) => {
  if (!notifications.length) {
    return null;
  }

  return (
    <div className="pos-notifications" aria-live="polite">
      {notifications.map((notification) => (
        <article className={`pos-notifications__item is-${notification.tone}`} key={notification.id}>
          <span>{notification.message}</span>
          <button type="button" aria-label="Notificationni yopish" onClick={() => onDismiss?.(notification.id)}>
            <X size={14} />
          </button>
        </article>
      ))}
    </div>
  );
};

export default POSNotifications;
