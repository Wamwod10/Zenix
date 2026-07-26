import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import "./CRMMetricCard.scss";

const getTrendDetails = ({ trend, positiveTrend }) => {
  if (trend === "neutral") {
    return {
      Icon: Minus,
      className: "is-neutral",
      label: "O‘zgarishsiz",
    };
  }

  const isPositive =
    positiveTrend === true || (positiveTrend !== false && trend === "up");

  return {
    Icon: trend === "down" ? ArrowDownRight : ArrowUpRight,
    className: isPositive ? "is-positive" : "is-negative",
    label: trend === "down" ? "Kamaydi" : "Oshdi",
  };
};

const formatChange = (change, changeType) => {
  if (!Number.isFinite(change)) {
    return null;
  }

  if (changeType === "absolute") {
    return `${change > 0 ? "+" : ""}${change.toLocaleString("uz-UZ")}`;
  }

  return `${Math.abs(change).toLocaleString("uz-UZ", {
    maximumFractionDigits: 1,
  })}%`;
};

const CRMMetricCard = ({
  label,
  value,
  description,
  change,
  changeType = "percentage",
  trend = "neutral",
  positiveTrend,
  tone = "indigo",
  icon: Icon,
  secondaryValue,
  secondaryLabel,
}) => {
  const trendDetails = getTrendDetails({
    trend,
    positiveTrend,
  });

  const TrendIcon = trendDetails.Icon;
  const formattedChange = formatChange(change, changeType);

  return (
    <article
      className={`crm-metric-card crm-metric-card--${tone}`}
      aria-label={`${label}: ${value}`}
    >
      <div className="crm-metric-card__light" aria-hidden="true" />

      <div className="crm-metric-card__top">
        <span className="crm-metric-card__icon" aria-hidden="true">
          {Icon && <Icon size={19} strokeWidth={1.9} />}
        </span>

        {formattedChange && (
          <span
            className={`crm-metric-card__trend ${trendDetails.className}`}
            aria-label={`${trendDetails.label}: ${formattedChange}`}
          >
            <TrendIcon size={14} strokeWidth={2.2} aria-hidden="true" />
            {formattedChange}
          </span>
        )}
      </div>

      <div className="crm-metric-card__body">
        <span className="crm-metric-card__label">{label}</span>
        <strong className="crm-metric-card__value">{value}</strong>

        {description && (
          <p className="crm-metric-card__description">{description}</p>
        )}
      </div>

      {secondaryValue !== undefined && secondaryValue !== null && (
        <div className="crm-metric-card__secondary">
          <span>{secondaryLabel}</span>
          <strong>
            {secondaryValue.toLocaleString("uz-UZ", {
              maximumFractionDigits: 1,
            })}
            %
          </strong>
        </div>
      )}
    </article>
  );
};

export default CRMMetricCard;
