import "./WarehouseKpiCard.scss";

const WarehouseKpiCard = ({ icon: Icon, label, value, hint, tone = "blue", onClick }) => {
  const Component = onClick ? "button" : "article";

  return (
    <Component
      className={`warehouse-kpi warehouse-kpi--${tone}`}
      type={onClick ? "button" : undefined}
      onClick={onClick}
    >
      <span className="warehouse-kpi__icon">{Icon && <Icon size={18} />}</span>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </Component>
  );
};

export default WarehouseKpiCard;
