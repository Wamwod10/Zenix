import { Archive, Search } from "lucide-react";

import { Dropdown } from "../../../../components/ui/Dropdown/Dropdown";
import {
  SUPPLIER_CATEGORIES,
  SUPPLIER_STATUSES,
  SUPPLIER_STATUS_LABELS,
} from "../../suppliersApi";

import "./SupplierFilters.scss";

const SupplierFilters = ({ filters, onChange }) => (
  <div className="supplier-filters">
    <label className="supplier-filters__search">
      <Search size={15} />
      <input
        type="text"
        placeholder="Nom, telefon yoki STIR bo'yicha qidirish..."
        value={filters.search}
        onChange={(event) => onChange("search", event.target.value)}
      />
    </label>

    <Dropdown
      className="supplier-filters__select"
      value={filters.category}
      placeholder="Barcha kategoriyalar"
      options={[
        { value: "all", label: "Barcha kategoriyalar" },
        ...SUPPLIER_CATEGORIES.map((category) => ({
          value: category.id,
          label: category.label,
        })),
      ]}
      onChange={(value) => onChange("category", value)}
    />

    <Dropdown
      className="supplier-filters__select"
      value={filters.status}
      placeholder="Barcha holatlar"
      options={[
        { value: "all", label: "Barcha holatlar" },
        ...Object.values(SUPPLIER_STATUSES).map((status) => ({
          value: status,
          label: SUPPLIER_STATUS_LABELS[status],
        })),
      ]}
      onChange={(value) => onChange("status", value)}
    />

    {/* Archive / Restore (Enterprise): standart ro'yxat arxivlangan
        supplierlarni ko'rsatmaydi — bu belgi bosilganda ular ham
        qo'shiladi, Restore tugmasi bilan bir joyda ko'rish uchun. */}
    <label className="supplier-filters__archived-toggle">
      <input
        type="checkbox"
        checked={!!filters.showArchived}
        onChange={(event) => onChange("showArchived", event.target.checked)}
      />
      <Archive size={14} />
      Arxivlanganlar
    </label>
  </div>
);

export default SupplierFilters;
