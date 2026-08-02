import "./FinanceKpiCard.scss";

const FinanceKpiCard = ({
  icon: Icon,
  label,
  value,
  hint,
  cta,
  tooltip,
  tone = "blue",
  trend = "+0%",
  sparkline = [24, 32, 28, 42, 38, 52],
  onClick,
}) => {
  const Component = onClick ? "button" : "article";
  const points = sparkline
    .map((point, index) => `${index * (100 / Math.max(1, sparkline.length - 1))},${60 - Math.min(58, Math.max(2, point))}`)
    .join(" ");

  return (
    <Component
      className={`finance-kpi finance-kpi--${tone}`}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={tooltip || hint}
      aria-label={cta ? `${label}: ${cta}` : label}
    >
      <span className="finance-kpi__icon">{Icon && <Icon size={18} />}</span>
      <span className="finance-kpi__trend">{trend}</span>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
      <svg className="finance-kpi__spark" viewBox="0 0 100 60" role="img" aria-label={`${label} mini trendi`}>
        <polyline points={points} fill="none" />
      </svg>
      {cta && <em>{cta}</em>}
    </Component>
  );
};

export default FinanceKpiCard;
