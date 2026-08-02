import { Archive, RotateCcw, Search } from "lucide-react";

import { Button } from "../../../../components/ui/Button/Button";
import { Dropdown } from "../../../../components/ui/Dropdown/Dropdown";
import { Input } from "../../../../components/ui/Input/Input";
import {
  SUPPLIER_CATEGORIES,
  SUPPLIER_STATUSES,
  SUPPLIER_STATUS_LABELS,
} from "../../suppliersApi";

import "./SupplierFilters.scss";

const SORT_OPTIONS = [
  { value: "name:asc", label: "Nom A-Z" },
  { value: "name:desc", label: "Nom Z-A" },
  { value: "score:desc", label: "Reyting yuqori" },
  { value: "leadTimeDays:asc", label: "Yetkazish tez" },
  { value: "debt:desc", label: "Qarz yuqori" },
  { value: "status:asc", label: "Holat" },
];

const SupplierFilters = ({ filters, onChange, onReset }) => (
  <div className="supplier-filters">
    <Input
      className="supplier-filters__search"
      aria-label="Yetkazib beruvchi qidirish"
      leftIcon={<Search size={15} />}
      type="search"
      placeholder="Nom, telefon, email yoki STIR bo'yicha qidirish..."
      value={filters.search}
      onChange={(event) => onChange("search", event.target.value)}
    />

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

    <Dropdown
      className="supplier-filters__select"
      value={`${filters.sortBy}:${filters.sortDirection}`}
      placeholder="Saralash"
      options={SORT_OPTIONS}
      onChange={(value) => {
        const [sortBy, sortDirection] = value.split(":");

        onChange("sortBy", sortBy);
        onChange("sortDirection", sortDirection);
      }}
    />

    <label className="supplier-filters__archived-toggle">
      <input
        type="checkbox"
        checked={!!filters.showArchived}
        onChange={(event) => onChange("showArchived", event.target.checked)}
      />
      <span className="supplier-filters__switch" aria-hidden="true" />
      <Archive size={14} />
      Arxivlanganlar
    </label>

    <Button variant="ghost" leftIcon={<RotateCcw size={14} />} onClick={onReset}>
      Tozalash
    </Button>
  </div>
);

export default SupplierFilters;
