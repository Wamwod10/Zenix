import { useMemo, useState } from "react";
import { BellOff, CheckCheck, LayoutList, ListTree, Trash2 } from "lucide-react";

import { Button } from "../../../../../components/ui/Button/Button";
import { EmptyState } from "../../../../../components/ui/EmptyState/EmptyState";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_TYPE_CATEGORY,
} from "../../notificationTypes";
import { NOTIFICATION_PRIORITY_WEIGHT } from "../../notificationPriority";
import { NOTIFICATION_STATUSES } from "../../notificationStatus";
import {
  DATE_BUCKET_LABELS,
  DATE_BUCKET_ORDER,
  getDateBucket,
} from "../../notificationsFormat";
import { DEFAULT_NOTIFICATION_FILTERS } from "../../notificationDefaults";
import NotificationFilters from "../NotificationFilters/NotificationFilters";
import NotificationItem from "../NotificationItem/NotificationItem";

import "./NotificationCenter.scss";

const matchesStatusFilter = (notification, statusFilter) => {
  if (statusFilter === "all") return true;
  if (statusFilter === "active") {
    return (
      notification.status === NOTIFICATION_STATUSES.unread ||
      notification.status === NOTIFICATION_STATUSES.read
    );
  }

  return notification.status === statusFilter;
};

const withinDateRange = (notification, dateFrom, dateTo) => {
  const createdAt = new Date(notification.createdAt);

  if (dateFrom && createdAt < new Date(dateFrom)) return false;

  if (dateTo) {
    const to = new Date(dateTo);

    to.setHours(23, 59, 59, 999);

    if (createdAt > to) return false;
  }

  return true;
};

const NotificationCenter = ({
  notifications = [],
  actions,
  suppliers = [],
  orders = [],
  loading = false,
}) => {
  const [filters, setFilters] = useState(DEFAULT_NOTIFICATION_FILTERS);
  const [viewMode, setViewMode] = useState("timeline");

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return notifications.filter((notification) => {
      if (!matchesStatusFilter(notification, filters.status)) return false;
      if (filters.type !== "all" && notification.type !== filters.type) return false;
      if (filters.priority !== "all" && notification.priority !== filters.priority) return false;
      if (
        filters.supplierId !== "all" &&
        notification.refs?.supplierId !== filters.supplierId
      ) {
        return false;
      }
      if (filters.orderId !== "all" && notification.refs?.orderId !== filters.orderId) {
        return false;
      }
      if (!withinDateRange(notification, filters.dateFrom, filters.dateTo)) return false;

      if (query) {
        const haystack = `${notification.title} ${notification.message}`.toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [notifications, filters]);

  const sorted = useMemo(() => {
    const list = [...filtered];

    if (filters.sort === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (filters.sort === "priority") {
      list.sort(
        (a, b) =>
          (NOTIFICATION_PRIORITY_WEIGHT[b.priority] || 0) -
            (NOTIFICATION_PRIORITY_WEIGHT[a.priority] || 0) ||
          new Date(b.createdAt) - new Date(a.createdAt),
      );
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [filtered, filters.sort]);

  const groupedSections = useMemo(() => {
    if (viewMode === "grouped") {
      const buckets = new Map();

      sorted.forEach((notification) => {
        const category = NOTIFICATION_TYPE_CATEGORY[notification.type] || NOTIFICATION_CATEGORIES.system;

        if (!buckets.has(category)) buckets.set(category, []);
        buckets.get(category).push(notification);
      });

      return Object.values(NOTIFICATION_CATEGORIES)
        .filter((category) => buckets.has(category))
        .map((category) => ({
          key: category,
          label: NOTIFICATION_CATEGORY_LABELS[category],
          items: buckets.get(category),
        }));
    }

    const buckets = new Map();

    sorted.forEach((notification) => {
      const bucket = getDateBucket(notification.createdAt);

      if (!buckets.has(bucket)) buckets.set(bucket, []);
      buckets.get(bucket).push(notification);
    });

    return DATE_BUCKET_ORDER.filter((bucket) => buckets.has(bucket)).map((bucket) => ({
      key: bucket,
      label: DATE_BUCKET_LABELS[bucket],
      items: buckets.get(bucket),
    }));
  }, [sorted, viewMode]);

  const hasReadItems = notifications.some(
    (notification) => notification.status === NOTIFICATION_STATUSES.read,
  );
  const hasUnreadItems = notifications.some(
    (notification) => notification.status === NOTIFICATION_STATUSES.unread,
  );
  const hasAnyNotifications = notifications.length > 0;

  return (
    <div className="notification-center">
      <div className="notification-center__header">
        <div className="notification-center__title">
          <strong>Bildirishnomalar</strong>
          <span>{notifications.length} ta yozuv</span>
        </div>

        <div className="notification-center__header-actions">
          <button
            type="button"
            className={viewMode === "timeline" ? "notification-center__view-btn--active" : ""}
            title="Vaqt chizig'i"
            aria-label="Vaqt chizig'i ko'rinishi"
            onClick={() => setViewMode("timeline")}
          >
            <ListTree size={15} />
          </button>
          <button
            type="button"
            className={viewMode === "grouped" ? "notification-center__view-btn--active" : ""}
            title="Turi bo'yicha guruhlash"
            aria-label="Guruhlangan ko'rinish"
            onClick={() => setViewMode("grouped")}
          >
            <LayoutList size={15} />
          </button>
        </div>
      </div>

      <div className="notification-center__toolbar">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<CheckCheck size={14} />}
          disabled={!hasUnreadItems}
          onClick={() => actions.markAllRead()}
        >
          Barchasini o'qilgan qilish
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Trash2 size={14} />}
          disabled={!hasReadItems}
          onClick={() => actions.clearRead()}
        >
          O'qilganlarni tozalash
        </Button>
      </div>

      <NotificationFilters filters={filters} onChange={setFilter} suppliers={suppliers} orders={orders} />

      <div className="notification-center__list" aria-live="polite">
        {loading ? (
          <div className="notification-center__loading">
            {[0, 1, 2].map((key) => (
              <div className="notification-center__skeleton" key={key} />
            ))}
          </div>
        ) : !hasAnyNotifications ? (
          <EmptyState
            icon={BellOff}
            title="Bildirishnoma yo'q"
            description="Hozircha hech qanday voqea qayd etilmagan."
          />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="Hech narsa topilmadi"
            description="Filtrlarga mos bildirishnoma yo'q — filtrni o'zgartiring."
          />
        ) : (
          groupedSections.map((section) => (
            <section className="notification-center__section" key={section.key}>
              <header>
                <span>{section.label}</span>
                <em>{section.items.length}</em>
              </header>

              <div className="notification-center__section-list">
                {section.items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={actions.markRead}
                    onMarkUnread={actions.markUnread}
                    onArchive={actions.archive}
                    onRestore={actions.restore}
                    onDismiss={actions.dismiss}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
