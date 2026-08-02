import { CalendarDays, Save, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { filterOptions } from "../../data/reportsMockData";
import { getFilterLabel, getValueLabel } from "../../utils/reportsFormatters";
import ReportsField from "../ReportsField/ReportsField";
import "./GlobalFilterBar.scss";

const compactFilters = ["branch", "warehouse", "category", "paymentMethod", "risk", "priority"];
const datePresetOptions = ["today", "last30", "month", "quarter", "year", "custom"];

const toOptions = (items) => items.map((item) => ({ value: item, label: getValueLabel(item) }));

const GlobalFilterBar = ({
  filters,
  customFilters,
  activeCustomFilter,
  onFilter,
  onSaveCustom,
  onApplyCustom,
  onDeleteCustom,
  onReset,
  onOpenDrawer,
}) => {
  const [name, setName] = useState("");
  const duplicateName = customFilters.some((item) => item.name.toLowerCase() === name.trim().toLowerCase());

  return (
    <section className="global-filter-bar" aria-label="Global hisobot filterlari">
      <div className="global-filter-bar__dates">
        <span>
          <CalendarDays size={14} />
          Global filter
        </span>
        <ReportsField
          label={getFilterLabel("datePreset")}
          type="select"
          value={filters.datePreset}
          options={toOptions(datePresetOptions)}
          onChange={(value) => onFilter("datePreset", value)}
        />
        <ReportsField label={getFilterLabel("startDate")} type="date" value={filters.startDate} onChange={(value) => onFilter("startDate", value)} />
        <ReportsField label={getFilterLabel("endDate")} type="date" value={filters.endDate} onChange={(value) => onFilter("endDate", value)} />
      </div>

      <div className="global-filter-bar__chips">
        {compactFilters.map((key) => (
          <ReportsField
            key={key}
            label={getFilterLabel(key)}
            type="select"
            value={filters[key]}
            options={toOptions(filterOptions[key])}
            onChange={(value) => onFilter(key, value)}
          />
        ))}
      </div>

      <div className="global-filter-bar__saved">
        <ReportsField
          label="Saqlanadigan filter nomi"
          value={name}
          onChange={setName}
          placeholder="Masalan: Toshkent yuqori risk"
          error={duplicateName ? "Bu nom band" : ""}
        />
        <button
          type="button"
          onClick={() => {
            onSaveCustom(name);
            if (!duplicateName) setName("");
          }}
          disabled={!name.trim() || duplicateName}
        >
          <Save size={14} />
          Saqlash
        </button>
        <ReportsField
          label="Saqlangan filter"
          type="select"
          value={activeCustomFilter}
          options={[{ value: "", label: "Tanlanmagan" }, ...customFilters.map((item) => ({ value: item.id, label: item.name }))]}
          onChange={onApplyCustom}
        />
        <button type="button" onClick={() => activeCustomFilter && onDeleteCustom(activeCustomFilter)} disabled={!activeCustomFilter}>
          <X size={14} />
          O'chirish
        </button>
        <button type="button" onClick={onReset}>
          <X size={14} />
          Tozalash
        </button>
        <button type="button" onClick={onOpenDrawer}>
          <SlidersHorizontal size={14} />
          Barcha filterlar
        </button>
      </div>
    </section>
  );
};

export default GlobalFilterBar;
