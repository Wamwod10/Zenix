import "./FinanceKpiCard.scss";

const FinanceKpiCard = ({ icon: Icon, label, value, hint, tone = "blue", onClick }) => {
  const Component = onClick ? "button" : "article";

  return (
    <Component
      className={`finance-kpi finance-kpi--${tone}`}
      type={onClick ? "button" : undefined}
      onClick={onClick}
    >
      <span className="finance-kpi__icon">{Icon && <Icon size={18} />}</span>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </Component>
  );
};

export default FinanceKpiCard;
