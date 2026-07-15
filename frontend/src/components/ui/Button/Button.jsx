import "./Button.scss";

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  type = "button",
  ...props
}) {
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? "ui-button--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type={type} {...props}>
      {leftIcon && <span className="ui-button__icon">{leftIcon}</span>}
      <span className="ui-button__label">{children}</span>
      {rightIcon && <span className="ui-button__icon">{rightIcon}</span>}
    </button>
  );
}
