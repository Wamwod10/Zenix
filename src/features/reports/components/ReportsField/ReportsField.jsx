import "./ReportsField.scss";

const ReportsField = ({ label, type = "text", value, options = [], onChange, error, children, ...props }) => (
  <label className={`reports-field ${error ? "is-invalid" : ""}`}>
    <span>{label}</span>
    {children || (
      type === "select" ? (
        <select value={value} onChange={(event) => onChange?.(event.target.value)} {...props}>
          {options.map((item) => {
            const option = typeof item === "string" ? { value: item, label: item } : item;
            return (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
      ) : (
        <input type={type} value={value} onChange={(event) => onChange?.(event.target.value)} {...props} />
      )
    )}
    {error && <small role="alert">{error}</small>}
  </label>
);

export default ReportsField;
