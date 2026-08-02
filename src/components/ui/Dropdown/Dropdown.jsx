import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./Dropdown.scss";

export function Dropdown({
  label,
  name,
  value,
  placeholder = "Tanlang",
  options = [],
  onChange,
  disabled = false,
  error,
  emptyText = "Variant topilmadi",
  className = "",
}) {
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState("");

  const selectedValue = value ?? internalValue;
  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue],
  );

  const handleSelect = (nextValue) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      className={`ui-dropdown ${isOpen ? "ui-dropdown--open" : ""} ${className}`}
      ref={dropdownRef}
    >
        {label && <label className="ui-dropdown__label">{label}</label>}

      <div className="ui-dropdown__control-wrap">
        <button
          className="ui-dropdown__control"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={Boolean(error)}
          disabled={disabled}
          title={disabled ? `${label || placeholder} hozircha faol emas` : undefined}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span
            className={
              selectedOption
                ? "ui-dropdown__value"
                : "ui-dropdown__value ui-dropdown__value--placeholder"
            }
          >
            {selectedOption?.label || placeholder}
          </span>

          <ChevronDown className="ui-dropdown__icon" size={18} />
        </button>

        {name && <input type="hidden" name={name} value={selectedValue} />}

        {isOpen && (
          <div className="ui-dropdown__menu" role="listbox">
            {options.length ? options.map((option) => {
              const isSelected = option.value === selectedValue;

              return (
                <button
                  className={`ui-dropdown__option ${
                    isSelected ? "ui-dropdown__option--selected" : ""
                  }`}
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={15} />}
                </button>
              );
            }) : (
              <div className="ui-dropdown__empty" role="status">
                {emptyText}
              </div>
            )}
          </div>
        )}
      </div>
      {error && <span className="ui-dropdown__error">{error}</span>}
    </div>
  );
}
