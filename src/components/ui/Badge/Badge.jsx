import "./Badge.scss";

export function Badge({ children, tone = "neutral", size = "md", className = "" }) {
  const classes = ["ui-badge", `ui-badge--${tone}`, `ui-badge--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}