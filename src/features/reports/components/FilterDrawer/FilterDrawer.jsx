import { X } from "lucide-react";

import { filterOptions } from "../../data/reportsMockData";
import { useReportsOverlay } from "../../hooks/useReportsOverlay";
import { getFilterLabel, getValueLabel } from "../../utils/reportsFormatters";
import ReportsField from "../ReportsField/ReportsField";
import "./FilterDrawer.scss";

const FilterDrawer = ({ open, filters, onFilter, onClose }) => {
  const panelRef = useReportsOverlay(open, onClose);

  if (!open) return null;

  return (
    <div className="reports-drawer" role="dialog" aria-modal="true" aria-label="Reports filter drawer">
      <button className="reports-drawer__backdrop" type="button" aria-label="Filterlarni yopish" onClick={onClose} />
      <aside className="reports-drawer__panel" ref={panelRef}>
        <div className="reports-drawer__head">
          <div>
            <span>Global filter</span>
            <h2>Barcha hisobotlar uchun</h2>
          </div>
          <button type="button" aria-label="Filter panelini yopish" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="reports-drawer__grid">
          {Object.entries(filterOptions).map(([key, options]) => (
            <ReportsField
              key={key}
              label={getFilterLabel(key)}
              type="select"
              value={filters[key]}
              options={options.map((item) => ({ value: item, label: getValueLabel(item) }))}
              onChange={(value) => onFilter(key, value)}
            />
          ))}
        </div>
      </aside>
    </div>
  );
};

export default FilterDrawer;
