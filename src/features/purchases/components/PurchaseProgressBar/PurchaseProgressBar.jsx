import "./PurchaseProgressBar.scss";

const PurchaseProgressBar = ({
  value = 0,
  max = 100,
  tone = "info",
  label,
  className = "",
}) => {
  const raw = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  const displayLabel = label || `${Math.round(raw)}%`;

  return (
    <span className={["purchase-progress", `purchase-progress--${tone}`, className].filter(Boolean).join(" ")}>
      <strong>{displayLabel}</strong>
      <small>{Number(value || 0).toLocaleString("uz-UZ")} / {Number(max || 0).toLocaleString("uz-UZ")}</small>
    </span>
  );
};

export default PurchaseProgressBar;
