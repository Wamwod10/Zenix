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
  onClick,
}) => {
  const Component = onClick ? "button" : "article";

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
      {cta && <em>{cta}</em>}
    </Component>
  );
};

export default FinanceKpiCard;
