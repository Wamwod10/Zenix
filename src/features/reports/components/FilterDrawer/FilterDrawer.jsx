import { useEffect } from "react";
import { X } from "lucide-react";

import { filterOptions } from "../../data/reportsMockData";
import "./FilterDrawer.scss";

const FilterDrawer = ({ open, filters, onFilter, onClose }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("reports-scroll-lock");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("reports-scroll-lock");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="reports-drawer" role="dialog" aria-modal="true" aria-label="Reports filter drawer">
      <button className="reports-drawer__backdrop" type="button" aria-label="Close filters" onClick={onClose} />
      <aside className="reports-drawer__panel">
        <div className="reports-drawer__head">
          <div>
            <span>Global filter</span>
            <h2>Barcha reportlar uchun</h2>
          </div>
          <button type="button" aria-label="Close filter drawer" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="reports-drawer__grid">
          {Object.entries(filterOptions).map(([key, options]) => (
            <label key={key}>
              <span>{key}</span>
              <select value={filters[key]} onChange={(event) => onFilter(key, event.target.value)}>
                {options.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default FilterDrawer;
