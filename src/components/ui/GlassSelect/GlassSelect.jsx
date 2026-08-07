import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "./GlassSelect.scss";

const getText = (node) => {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getText).join("");
  }

  if (isValidElement(node)) {
    return getText(node.props.children);
  }

  return "";
};

const extractOptions = (children, group = null) =>
  Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) {
      return [];
    }

    if (child.type === Fragment) {
      return extractOptions(child.props.children, group);
    }

    if (child.type === "optgroup") {
      return extractOptions(child.props.children, {
        label: child.props.label,
        disabled: child.props.disabled,
      });
    }

    if (child.type !== "option") {
      return [];
    }

    const label = getText(child.props.children).trim();
    const value = child.props.value ?? label;

    return [{
      disabled: Boolean(child.props.disabled || group?.disabled),
      groupLabel: group?.label,
      label,
      node: child.props.children,
      value: String(value),
    }];
  });

export function GlassSelect({
  children,
  className = "",
  defaultValue,
  disabled = false,
  id,
  name,
  onBlur,
  onChange,
  onFocus,
  placeholder = "Tanlang",
  required,
  title,
  value,
  ...props
}) {
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const options = useMemo(() => extractOptions(children), [children]);
  const firstEnabledValue = options.find((option) => !option.disabled)?.value ?? "";
  const [internalValue, setInternalValue] = useState(
    defaultValue !== undefined ? String(defaultValue) : firstEnabledValue,
  );

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? String(value) : internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    if (!isControlled && !selectedValue && firstEnabledValue) {
      setInternalValue(firstEnabledValue);
    }
  }, [firstEnabledValue, isControlled, selectedValue]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedControl = rootRef.current?.contains(event.target);
      const clickedMenu = menuRef.current?.contains(event.target);

      if (!clickedControl && !clickedMenu) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const updateMenuPosition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const viewportGap = 12;
    const menuGap = 8;
    const preferredHeight = Math.min(320, window.innerHeight * 0.52);
    const spaceBelow = window.innerHeight - rect.bottom - viewportGap;
    const spaceAbove = rect.top - viewportGap;
    const openUp = spaceBelow < Math.min(220, preferredHeight) && spaceAbove > spaceBelow;
    const availableHeight = openUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(160, Math.min(preferredHeight, availableHeight - menuGap));
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

  const emitChange = (nextValue) => {
    const changeEvent = {
      target: { value: nextValue, name },
      currentTarget: { value: nextValue, name },
      preventDefault() {},
      stopPropagation() {},
    };

    onChange?.(changeEvent);
  };

  const handleSelect = (option) => {
    if (disabled || option.disabled) {
      return;
    }

    if (!isControlled) {
      setInternalValue(option.value);
    }

    emitChange(option.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (disabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen((current) => !current);
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    const enabledOptions = options.filter((option) => !option.disabled);
    const selectedIndex = enabledOptions.findIndex((option) => option.value === selectedValue);
    const offset = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = selectedIndex < 0
      ? 0
      : (selectedIndex + offset + enabledOptions.length) % enabledOptions.length;

    if (enabledOptions[nextIndex]) {
      handleSelect(enabledOptions[nextIndex]);
    }
  };

  const menu = isOpen ? (
    <span
      className="ui-glass-select__menu ui-glass-select__menu--portal"
      ref={menuRef}
      role="listbox"
      style={menuStyle ?? undefined}
    >
      {options.map((option, index) => {
        const isSelected = option.value === selectedValue;
        const showGroup = option.groupLabel && option.groupLabel !== options[index - 1]?.groupLabel;

        return (
          <span className="ui-glass-select__item-wrap" key={`${option.groupLabel || "root"}-${option.value}`}>
            {showGroup && <span className="ui-glass-select__group">{option.groupLabel}</span>}
            <button
              aria-selected={isSelected}
              className={[
                "ui-glass-select__option",
                isSelected ? "ui-glass-select__option--selected" : "",
              ].filter(Boolean).join(" ")}
              disabled={option.disabled}
              onClick={() => handleSelect(option)}
              role="option"
              type="button"
            >
              <span>{option.node}</span>
              {isSelected && <Check size={15} />}
            </button>
          </span>
        );
      })}
    </span>
  ) : null;

  return (
    <span
      className={[
        "ui-glass-select",
        isOpen ? "ui-glass-select--open" : "",
        disabled ? "ui-glass-select--disabled" : "",
        props["aria-invalid"] ? "ui-glass-select--invalid" : "",
        className,
      ].filter(Boolean).join(" ")}
      ref={rootRef}
    >
      <select
        {...props}
        aria-hidden="true"
        className="ui-glass-select__native"
        disabled={disabled}
        id={id}
        name={name}
        onChange={() => {}}
        onFocus={() => buttonRef.current?.focus()}
        required={required}
        tabIndex={-1}
        value={selectedValue}
      >
        {children}
      </select>

      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={props["aria-invalid"]}
        aria-label={props["aria-label"] || title || placeholder}
        className="ui-glass-select__control"
        disabled={disabled}
        onBlur={onBlur}
        onClick={() => setIsOpen((current) => !current)}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        ref={buttonRef}
        title={title}
        type="button"
      >
        <span className={selectedOption ? "ui-glass-select__value" : "ui-glass-select__value is-placeholder"}>
          {selectedOption?.node || placeholder}
        </span>
        <ChevronDown className="ui-glass-select__icon" size={18} />
      </button>

      {menu && (typeof document === "undefined" ? menu : createPortal(menu, document.body))}
    </span>
  );
}
