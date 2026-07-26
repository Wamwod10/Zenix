import { Search } from "lucide-react";

import { NOTIFICATION_TYPE_LABELS } from "../../notificationTypes";
import { NOTIFICATION_PRIORITY_LABELS } from "../../notificationPriority";
import { NOTIFICATION_STATUS_LABELS } from "../../notificationStatus";

import "./NotificationFilters.scss";

export const DEFAULT_NOTIFICATION_FILTERS = {
  search: "",
  type: "all",
  priority: "all",
  status: "active", // "active" = unread + read (arxiv/yopilgan yashirin)
  supplierId: "all",
  orderId: "all",
  dateFrom: "",
  dateTo: "",
  sort: "newest",
};

const NotificationFilters = ({ filters, onChange, suppliers = [], orders = [] }) => {
  const setFilter = (key) => (event) => onChange(key, event.target.value);

  return (
    <div className="notification-filters">
      <div className="notification-filters__search">
        <Search size={14} />
        <input
          type="text"
          placeholder="Qidirish..."
          value={filters.search}
          onChange={setFilter("search")}
        />
      </div>

      <div className="notification-filters__row">
        <select value={filters.type} onChange={setFilter("type")}>
          <option value="all">Barcha turlar</option>
          {Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select value={filters.priority} onChange={setFilter("priority")}>
          <option value="all">Barcha ustuvorlik</option>
          {Object.entries(NOTIFICATION_PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select value={filters.status} onChange={setFilter("status")}>
          <option value="active">Faol (o'qilmagan+o'qilgan)</option>
          <option value="unread">{NOTIFICATION_STATUS_LABELS.unread}</option>
          <option value="read">{NOTIFICATION_STATUS_LABELS.read}</option>
          <option value="archived">{NOTIFICATION_STATUS_LABELS.archived}</option>
          <option value="dismissed">{NOTIFICATION_STATUS_LABELS.dismissed}</option>
          <option value="all">Barchasi</option>
        </select>
      </div>

      <div className="notification-filters__row">
        <select value={filters.supplierId} onChange={setFilter("supplierId")}>
          <option value="all">Barcha yetkazib beruvchi</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>

        <select value={filters.orderId} onChange={setFilter("orderId")}>
          <option value="all">Barcha buyurtma</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.number}
            </option>
          ))}
        </select>

        <select value={filters.sort} onChange={setFilter("sort")}>
          <option value="newest">Yangi avval</option>
          <option value="oldest">Eski avval</option>
          <option value="priority">Ustuvorlik bo'yicha</option>
        </select>
      </div>

      <div className="notification-filters__row notification-filters__row--dates">
        <label>
          Sanadan
          <input type="date" value={filters.dateFrom} onChange={setFilter("dateFrom")} />
        </label>
        <label>
          Sanagacha
          <input type="date" value={filters.dateTo} onChange={setFilter("dateTo")} />
        </label>
      </div>
    </div>
  );
};

export default NotificationFilters;
