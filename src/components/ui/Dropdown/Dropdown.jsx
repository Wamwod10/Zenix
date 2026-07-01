import { ChevronDown } from "lucide-react";
import "./Dropdown.scss";

export function Dropdown({
  label,
  value,
  placeholder = "Select option",
  options = [],
  onChange,
  className = "",
}) {
  return (
    <div className={`ui-dropdown ${className}`}>
      {label && <label className="ui-dropdown__label">{label}</label>}

      <div className="ui-dropdown__control">
        <select
          className="ui-dropdown__select"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="ui-dropdown__icon" size={18} />
      </div>
    </div>
  );
}