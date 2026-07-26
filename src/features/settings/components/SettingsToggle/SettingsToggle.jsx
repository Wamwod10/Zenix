import "./SettingsToggle.scss";

const SettingsToggle = ({ label, description, checked, disabled, onChange }) => (
  <button
    type="button"
    className={`settings-toggle ${checked ? "is-on" : ""}`}
    aria-pressed={checked}
    disabled={disabled}
    onClick={() => onChange?.(!checked)}
  >
    <span>
      <strong>{label}</strong>
      {description && <small>{description}</small>}
    </span>
    <i aria-hidden="true" />
  </button>
);

export default SettingsToggle;
