import "./PurchaseProgressBar.scss";

const PurchaseProgressBar = ({
  value = 0,
  max = 100,
  tone = "info",
  label,
  className = "",
  minPercent = 0,
}) => {
  const raw = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  const percent = Math.max(raw, minPercent);

  return (
    <div className={["purchase-progress", className].filter(Boolean).join(" ")}>
      <span className="purchase-progress__track">
        <span
          className={`purchase-progress__fill purchase-progress__fill--${tone}`}
          style={{ width: `${percent}%` }}
        />
      </span>

      {label && <span className="purchase-progress__label">{label}</span>}
    </div>
  );
};

export default PurchaseProgressBar;
