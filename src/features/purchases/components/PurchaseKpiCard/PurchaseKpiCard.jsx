import "./PurchaseKpiCard.scss";

// Quick-filter kartochkasi: `onClick` uzatilsa karta bosiladigan tugma
// bo'ladi (statistik kartani filtr sifatida ishlatish uchun) — `onClick`
// uzatilmasa avvalgidek oddiy `<article>` bo'lib qoladi (boshqa barcha
// joylardagi ishlatilishlar o'zgarishsiz qoladi).
const PurchaseKpiCard = ({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
  onClick,
  active = false,
}) => {
  const classes = [
    "purchase-kpi-card",
    `purchase-kpi-card--${tone}`,
    onClick ? "purchase-kpi-card--clickable" : "",
    active ? "purchase-kpi-card--active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className="purchase-kpi-card__icon">
        {Icon ? <Icon size={20} /> : null}
      </span>

      <div className="purchase-kpi-card__body">
        <span className="purchase-kpi-card__label">{label}</span>
        <strong className="purchase-kpi-card__value">{value}</strong>
        {hint ? <small className="purchase-kpi-card__hint">{hint}</small> : null}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        aria-pressed={active}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return <article className={classes}>{content}</article>;
};

export default PurchaseKpiCard;
