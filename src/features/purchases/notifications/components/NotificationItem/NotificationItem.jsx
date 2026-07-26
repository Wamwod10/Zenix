import { Link } from "react-router-dom";
import { Archive, ArchiveRestore, Check, RotateCcw, X } from "lucide-react";

import { getNotificationIcon } from "../../notificationIcons";
import { NOTIFICATION_PRIORITY_TONES } from "../../notificationPriority";
import { NOTIFICATION_STATUSES } from "../../notificationStatus";
import { formatRelativeTime } from "../../notificationsFormat";

import "./NotificationItem.scss";

const NotificationItem = ({
  notification,
  onMarkRead,
  onMarkUnread,
  onArchive,
  onRestore,
  onDismiss,
}) => {
  const Icon = getNotificationIcon(notification.type);
  const tone = NOTIFICATION_PRIORITY_TONES[notification.priority] || "neutral";
  const isUnread = notification.status === NOTIFICATION_STATUSES.unread;
  const isArchived = notification.status === NOTIFICATION_STATUSES.archived;

  const handleOpen = () => {
    if (isUnread) onMarkRead?.(notification.id);
  };

  const body = (
    <>
      <span className={`notification-item__icon notification-item__icon--${tone}`}>
        <Icon size={16} />
      </span>

      <div className="notification-item__body">
        <div className="notification-item__head">
          <strong>{notification.title}</strong>
          <span className="notification-item__time">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        {notification.message && <p>{notification.message}</p>}
      </div>
    </>
  );

  return (
    <article
      className={[
        "notification-item",
        isUnread ? "notification-item--unread" : "",
        isArchived ? "notification-item--archived" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isUnread && <span className="notification-item__dot" aria-hidden="true" />}

      {notification.link ? (
        <Link to={notification.link} className="notification-item__link" onClick={handleOpen}>
          {body}
        </Link>
      ) : (
        <button
          type="button"
          className="notification-item__link notification-item__link--static"
          onClick={handleOpen}
        >
          {body}
        </button>
      )}

      <div className="notification-item__actions">
        {!isArchived &&
          (isUnread ? (
            <button
              type="button"
              title="O'qilgan deb belgilash"
              aria-label="O'qilgan deb belgilash"
              onClick={() => onMarkRead?.(notification.id)}
            >
              <Check size={14} />
            </button>
          ) : (
            <button
              type="button"
              title="O'qilmagan deb belgilash"
              aria-label="O'qilmagan deb belgilash"
              onClick={() => onMarkUnread?.(notification.id)}
            >
              <RotateCcw size={14} />
            </button>
          ))}

        {isArchived ? (
          <button
            type="button"
            title="Tiklash"
            aria-label="Tiklash"
            onClick={() => onRestore?.(notification.id)}
          >
            <ArchiveRestore size={14} />
          </button>
        ) : (
          <button
            type="button"
            title="Arxivlash"
            aria-label="Arxivlash"
            onClick={() => onArchive?.(notification.id)}
          >
            <Archive size={14} />
          </button>
        )}

        <button
          type="button"
          title="Yopish"
          aria-label="Yopish"
          onClick={() => onDismiss?.(notification.id)}
        >
          <X size={14} />
        </button>
      </div>
    </article>
  );
};

export default NotificationItem;
