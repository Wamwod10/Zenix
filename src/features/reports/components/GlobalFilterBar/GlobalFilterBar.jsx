import { CalendarDays, Save, X } from "lucide-react";
import { useState } from "react";

import { filterOptions } from "../../data/reportsMockData";
import "./GlobalFilterBar.scss";

const compactFilters = ["branch", "warehouse", "category", "paymentMethod", "risk", "priority"];

const GlobalFilterBar = ({ filters, customFilters, onFilter, onSaveCustom, onApplyCustom, onOpenDrawer }) => {
  const [name, setName] = useState("");

  return (
    <section className="global-filter-bar" aria-label="Global reports filters">
      <div className="global-filter-bar__dates">
        <span>
          <CalendarDays size={14} />
          Global filter
        </span>
        <select value={filters.datePreset} onChange={(event) => onFilter("datePreset", event.target.value)} aria-label="Date preset">
          <option value="today">Bugun</option>
          <option value="last30">Oxirgi 30 kun</option>
          <option value="month">Bu oy</option>
          <option value="quarter">Kvartal</option>
          <option value="year">Yil</option>
          <option value="custom">Custom</option>
        </select>
        <input type="date" value={filters.startDate} onChange={(event) => onFilter("startDate", event.target.value)} aria-label="Start date" />
        <input type="date" value={filters.endDate} onChange={(event) => onFilter("endDate", event.target.value)} aria-label="End date" />
      </div>

      <div className="global-filter-bar__chips">
        {compactFilters.map((key) => (
          <label key={key}>
            <span>{key}</span>
            <select value={filters[key]} onChange={(event) => onFilter(key, event.target.value)} aria-label={`${key} filter`}>
              {filterOptions[key].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="global-filter-bar__saved">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Custom filter nomi"
          aria-label="Custom filter name"
        />
        <button
          type="button"
          onClick={() => {
            onSaveCustom(name);
            setName("");
          }}
          disabled={!name.trim()}
        >
          <Save size={14} />
          Saqlash
        </button>
        <select value="" onChange={(event) => onApplyCustom(event.target.value)} aria-label="Saved custom filters">
          <option value="">Saved filters</option>
          {customFilters.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={onOpenDrawer}>
          <X size={14} />
          Barcha filter
        </button>
      </div>
    </section>
  );
};

export default GlobalFilterBar;
