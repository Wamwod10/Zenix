// Notification Center trigger — Purchases va Suppliers sahifalarida
// mustaqil o'rnatiladi (global Header/Router o'zgartirilmaydi). Badge
// hisoblagichi, panel va kritik/yuqori ustuvorlikdagi voqealar uchun mavjud
// global toast (`useNotification`) ko'prigi shu yerda birlashtirilgan.

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import { useNotification } from "../../../../../components/ui/Notification/NotificationContext";
import usePurchasesStore from "../../../hooks/usePurchasesStore";
import { useSuppliers } from "../../../../suppliers/suppliersApi";
import { useNotificationsStore } from "../../notificationsStore";
import { useNotificationsSync } from "../../useNotificationsSync";
import { NOTIFICATION_PRIORITIES } from "../../notificationPriority";
import { NOTIFICATION_STATUSES } from "../../notificationStatus";
import NotificationCenter from "../NotificationCenter/NotificationCenter";

import "./NotificationBell.scss";

const TOAST_TYPE_BY_PRIORITY = {
  [NOTIFICATION_PRIORITIES.critical]: "error",
  [NOTIFICATION_PRIORITIES.high]: "warning",
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const seenIdsRef = useRef(null);

  const { notifications, actions } = useNotificationsStore();
  const { orders } = usePurchasesStore();
  const { suppliers } = useSuppliers();
  const { notify } = useNotification();

  useNotificationsSync();

  // Kritik/yuqori ustuvorlikdagi YANGI bildirishnomalar uchun mavjud global
  // toast tizimiga ko'prik — birinchi render'da (seed/derived boshlang'ich
  // yuklanish) toast otilmasin, faqat SHU DAN KEYIN paydo bo'lganlarga.
  useEffect(() => {
    const currentIds = new Set(notifications.map((entry) => entry.id));

    if (seenIdsRef.current === null) {
      seenIdsRef.current = currentIds;
      return;
    }

    const freshOnes = notifications.filter(
      (entry) => entry.status === NOTIFICATION_STATUSES.unread && !seenIdsRef.current.has(entry.id),
    );

    freshOnes.forEach((entry) => {
      const toastType = TOAST_TYPE_BY_PRIORITY[entry.priority];

      if (toastType) notify({ message: entry.title, type: toastType });
    });

    seenIdsRef.current = currentIds;
  }, [notifications, notify]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter(
    (entry) => entry.status === NOTIFICATION_STATUSES.unread,
  ).length;

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="notification-bell__trigger"
        aria-label="Bildirishnomalar"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-bell__panel">
          <NotificationCenter
            notifications={notifications}
            actions={actions}
            suppliers={suppliers}
            orders={orders}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
