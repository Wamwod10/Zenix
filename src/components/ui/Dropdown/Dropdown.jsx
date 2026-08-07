import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const controlRef = useRef(null);
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
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
      const clickedControl = dropdownRef.current?.contains(event.target);
      const clickedMenu = menuRef.current?.contains(event.target);

      if (!clickedControl && !clickedMenu) {
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

  const updateMenuPosition = useCallback(() => {
    const rect = controlRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const viewportGap = 12;
    const menuGap = 8;
    const preferredHeight = Math.min(300, window.innerHeight * 0.52);
    const spaceBelow = window.innerHeight - rect.bottom - viewportGap;
    const spaceAbove = rect.top - viewportGap;
    const openUp = spaceBelow < Math.min(210, preferredHeight) && spaceAbove > spaceBelow;
    const availableHeight = openUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(150, Math.min(preferredHeight, availableHeight - menuGap));
    const left = Math.min(
      Math.max(viewportGap, rect.left),
      Math.max(viewportGap, window.innerWidth - rect.width - viewportGap),
    );

    setMenuStyle({
      left,
      maxHeight,
      position: "fixed",
      top: openUp
        ? Math.max(viewportGap, rect.top - maxHeight - menuGap)
        : Math.min(window.innerHeight - viewportGap - maxHeight, rect.bottom + menuGap),
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen, updateMenuPosition]);

  const menu = isOpen ? (
    <div
      className="ui-dropdown__menu ui-dropdown__menu--portal"
      ref={menuRef}
      role="listbox"
      style={menuStyle ?? undefined}
    >
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
  ) : null;

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
          ref={controlRef}
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

        {menu && (typeof document === "undefined" ? menu : createPortal(menu, document.body))}
      </div>
      {error && <span className="ui-dropdown__error">{error}</span>}
    </div>
  );
}
