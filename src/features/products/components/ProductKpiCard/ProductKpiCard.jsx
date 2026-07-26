const ProductKpiCard = ({ icon: Icon, label, value, meta, tone = "blue" }) => (
  <article className={`product-kpi-card product-kpi-card--${tone}`}>
    <span className="product-kpi-card__icon">{Icon && <Icon size={18} />}</span>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      {meta && <small>{meta}</small>}
    </div>
  </article>
);

export default ProductKpiCard;
