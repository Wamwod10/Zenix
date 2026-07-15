import "./Input.scss";

export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  className = "",
  id,
  ...props
}) {
  const inputId = id || props.name;

  const classes = ["ui-input", error ? "ui-input--error" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {label && (
        <label className="ui-input__label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className="ui-input__control">
        {leftIcon && <span className="ui-input__icon">{leftIcon}</span>}

        <input id={inputId} className="ui-input__field" {...props} />

        {rightIcon && <span className="ui-input__icon">{rightIcon}</span>}
      </div>

      {(hint || error) && (
        <p className="ui-input__message">
          {error || hint}
        </p>
      )}
    </div>
  );
}