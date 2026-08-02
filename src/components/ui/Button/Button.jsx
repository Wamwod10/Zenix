import "./Button.scss";

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  title,
  "aria-label": ariaLabel,
  className = "",
  type = "button",
  ...props
}) {
  const isIconOnly = Boolean((leftIcon || rightIcon) && !children);
  const accessibleLabel = ariaLabel || (typeof title === "string" ? title : undefined);

  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? "ui-button--full" : "",
    isIconOnly ? "ui-button--icon-only" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      type={type}
      aria-label={accessibleLabel}
      title={title || accessibleLabel}
      {...props}
    >
      {leftIcon && <span className="ui-button__icon">{leftIcon}</span>}
      {children && <span className="ui-button__label">{children}</span>}
      {rightIcon && <span className="ui-button__icon">{rightIcon}</span>}
    </button>
  );
}
