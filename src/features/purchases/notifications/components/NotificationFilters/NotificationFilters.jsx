import { Search } from "lucide-react";

import PurchaseSelectField from "../../../components/PurchaseSelectField/PurchaseSelectField";
import { NOTIFICATION_TYPE_LABELS } from "../../notificationTypes";
import { NOTIFICATION_PRIORITY_LABELS } from "../../notificationPriority";
import { NOTIFICATION_STATUS_LABELS } from "../../notificationStatus";

import "./NotificationFilters.scss";

const NotificationFilters = ({ filters, onChange, suppliers = [], orders = [] }) => {
  const setFilter = (key) => (event) => onChange(key, event.target.value);
  const setSelectFilter = (key) => (value) => onChange(key, value);
  const typeOptions = [
    { value: "all", label: "Barcha turlar" },
    ...Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ];
  const priorityOptions = [
    { value: "all", label: "Barcha ustuvorlik" },
    ...Object.entries(NOTIFICATION_PRIORITY_LABELS).map(([value, label]) => ({ value, label })),
  ];
  const statusOptions = [
    { value: "active", label: "Faol (o'qilmagan+o'qilgan)" },
    { value: "unread", label: NOTIFICATION_STATUS_LABELS.unread },
    { value: "read", label: NOTIFICATION_STATUS_LABELS.read },
    { value: "archived", label: NOTIFICATION_STATUS_LABELS.archived },
    { value: "dismissed", label: NOTIFICATION_STATUS_LABELS.dismissed },
    { value: "all", label: "Barchasi" },
  ];
  const supplierOptions = [
    { value: "all", label: "Barcha yetkazib beruvchi" },
    ...suppliers.map((supplier) => ({ value: supplier.id, label: supplier.name })),
  ];
  const orderOptions = [
    { value: "all", label: "Barcha buyurtma" },
    ...orders.map((order) => ({ value: order.id, label: order.number })),
  ];
  const sortOptions = [
    { value: "newest", label: "Yangi avval" },
    { value: "oldest", label: "Eski avval" },
    { value: "priority", label: "Ustuvorlik bo'yicha" },
  ];

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
        <PurchaseSelectField value={filters.type} options={typeOptions} onChange={setSelectFilter("type")} />
        <PurchaseSelectField value={filters.priority} options={priorityOptions} onChange={setSelectFilter("priority")} />
        <PurchaseSelectField value={filters.status} options={statusOptions} onChange={setSelectFilter("status")} />
      </div>

      <div className="notification-filters__row">
        <PurchaseSelectField value={filters.supplierId} options={supplierOptions} onChange={setSelectFilter("supplierId")} />
        <PurchaseSelectField value={filters.orderId} options={orderOptions} onChange={setSelectFilter("orderId")} />
        <PurchaseSelectField value={filters.sort} options={sortOptions} onChange={setSelectFilter("sort")} />
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
