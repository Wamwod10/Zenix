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

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    if (type === "number") {
      onChange?.(nextValue === "" ? "" : Number(nextValue));
      return;
    }
    onChange?.(nextValue);
  };

  return (
  <label className={`settings-field ${error ? "settings-field--error" : ""}`} htmlFor={fieldId}>
    <span>{label}</span>
    {options ? (
      <select
        id={fieldId}
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange?.(event.target.value)}
      >
        {options.map((option) => {
          const normalized = normalizeOption(option);
          return (
          <option key={String(normalized.value)} value={normalized.value}>
            {normalized.label}
          </option>
          );
        })}
      </select>
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
