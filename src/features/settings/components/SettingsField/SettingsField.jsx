import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Upload } from "lucide-react";

import "./SettingsField.scss";

const normalizeOption = (option) => {
  if (option && typeof option === "object") {
    return {
      value: Object.prototype.hasOwnProperty.call(option, "value") ? option.value : option.id,
      label: Object.prototype.hasOwnProperty.call(option, "label") ? option.label : option.name,
    };
  }
  return { value: option, label: option };
};

const SettingsField = ({
  id,
  label,
  value,
  type = "text",
  options,
  error,
  disabled,
  onChange,
  placeholder,
}) => {
  const fieldId = id || `settings-field-${String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const errorId = `${fieldId}-error`;
  const listId = `${fieldId}-listbox`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const normalizedOptions = useMemo(() => (options || []).map(normalizeOption), [options]);
  const selectedOption = normalizedOptions.find((option) => String(option.value) === String(value));
  const fileName = typeof value === "string" && value ? value.split(/[/\\]/).pop() : "";

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    if (type === "number") {
      onChange?.(nextValue === "" ? "" : Number(nextValue));
      return;
    }
    onChange?.(nextValue);
  };

  return (
  <label className={`settings-field ${error ? "settings-field--error" : ""}`} htmlFor={fieldId} ref={rootRef}>
    <span>{label}</span>
    {options ? (
      <div className={`settings-field__select ${open ? "is-open" : ""}`}>
        <button
          id={fieldId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onClick={() => setOpen((current) => !current)}
        >
          <em>{selectedOption?.label || "Tanlang"}</em>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
        {open && (
          <div id={listId} className="settings-field__options" role="listbox" aria-label={label}>
            {normalizedOptions.map((option) => {
              const selected = String(option.value) === String(value);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={selected ? "is-selected" : ""}
                  onClick={() => {
                    onChange?.(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    ) : type === "textarea" ? (
      <textarea
        id={fieldId}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange?.(event.target.value)}
      />
    ) : type === "file" ? (
      <span className="settings-field__file">
        <input
          id={fieldId}
          type="file"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={handleInputChange}
        />
        <span className="settings-field__file-action">
          <Upload size={15} aria-hidden="true" />
          Fayl tanlash
        </span>
        <span className="settings-field__file-name">{fileName || placeholder || "Fayl tanlanmagan"}</span>
      </span>
    ) : (
      <input
        id={fieldId}
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={handleInputChange}
      />
    )}
    {error && <small id={errorId}>{error}</small>}
  </label>
  );
};

export default SettingsField;
