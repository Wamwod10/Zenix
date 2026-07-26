import "./HRKpiCard.scss";

const HRKpiCard = ({ icon: Icon, label, value, meta, tone = "blue", onClick }) => {
  const Component = onClick ? "button" : "article";

  return (
    <Component
      type={onClick ? "button" : undefined}
      className={`hr-kpi-card hr-kpi-card--${tone}`}
      onClick={onClick}
    >
      <span className="hr-kpi-card__orb">{Icon && <Icon size={19} />}</span>
      <span className="hr-kpi-card__copy">
        <small>{label}</small>
        <strong>{value}</strong>
        {meta && <em>{meta}</em>}
      </span>
    </Component>
  );
};

export default HRKpiCard;
