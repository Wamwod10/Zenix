// PDF 73/77 (Enterprise Reports & Analytics): barcha hisobot/tahlil
// bo'limlari uchun YAGONA filtr paneli — Sana oralig'i, Yetkazib beruvchi,
// Kategoriya, Bo'lim, Loyiha, Ombor, Valyuta, Holat. Mavjud Purchase*Field
// komponentlari qayta ishlatiladi (yangi input uslubi yaratilmaydi).

import { RotateCcw } from "lucide-react";

import PurchaseDateField from "../PurchaseDateField/PurchaseDateField";
import PurchaseSelectField from "../PurchaseSelectField/PurchaseSelectField";

import "./ReportFilterBar.scss";

const ALL_OPTION = { value: "all", label: "Barchasi" };

const ReportFilterBar = ({ filters, setFilter, resetFilters, options, activeFilterCount = 0 }) => (
  <section className="report-filter-bar">
    <div className="report-filter-bar__grid">
      <PurchaseDateField
        label="Sanadan"
        name="dateFrom"
        value={filters.dateFrom}
        onChange={(event) => setFilter("dateFrom", event.target.value)}
      />
      <PurchaseDateField
        label="Sanagacha"
        name="dateTo"
        value={filters.dateTo}
        onChange={(event) => setFilter("dateTo", event.target.value)}
      />

      <PurchaseSelectField
        label="Yetkazib beruvchi"
        value={filters.supplierId}
        options={[ALL_OPTION, ...options.suppliers]}
        onChange={(value) => setFilter("supplierId", value)}
      />

      <PurchaseSelectField
        label="Kategoriya"
        value={filters.category}
        options={[ALL_OPTION, ...options.categories]}
        onChange={(value) => setFilter("category", value)}
      />

      <PurchaseSelectField
        label="Bo'lim"
        value={filters.department}
        options={[ALL_OPTION, ...options.departments]}
        onChange={(value) => setFilter("department", value)}
      />

      <PurchaseSelectField
        label="Loyiha"
        value={filters.project}
        options={[ALL_OPTION, ...options.projects]}
        onChange={(value) => setFilter("project", value)}
      />

      <PurchaseSelectField
        label="Ombor"
        value={filters.warehouseId}
        options={[ALL_OPTION, ...options.warehouses]}
        onChange={(value) => setFilter("warehouseId", value)}
      />

      <PurchaseSelectField
        label="Valyuta"
        value={filters.currency}
        options={[ALL_OPTION, ...options.currencies]}
        onChange={(value) => setFilter("currency", value)}
      />

      <PurchaseSelectField
        label="Holat"
        value={filters.status}
        options={[ALL_OPTION, ...options.statuses]}
        onChange={(value) => setFilter("status", value)}
      />
    </div>

    <button
      type="button"
      className="report-filter-bar__reset"
      onClick={resetFilters}
      disabled={activeFilterCount === 0}
    >
      <RotateCcw size={14} />
      Filtrlarni tozalash
      {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
    </button>
  </section>
);

export default ReportFilterBar;
