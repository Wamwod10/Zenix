import "./Card.scss";

export function Card({ children, className = "", padded = true, interactive = false, ...props }) {
  const classes = [
    "ui-card",
    padded ? "ui-card--padded" : "",
    interactive ? "ui-card--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}