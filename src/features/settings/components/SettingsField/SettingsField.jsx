import "./SettingsField.scss";

const SettingsField = ({
  label,
  value,
  type = "text",
  options,
  error,
  disabled,
  onChange,
  placeholder,
}) => (
  <label className={`settings-field ${error ? "settings-field--error" : ""}`}>
    <span>{label}</span>
    {options ? (
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    ) : type === "textarea" ? (
      <textarea
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
      />
    ) : (
      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) =>
          onChange?.(type === "number" ? Number(event.target.value) : event.target.value)
        }
      />
    )}
    {error && <small>{error}</small>}
  </label>
);

export default SettingsField;
