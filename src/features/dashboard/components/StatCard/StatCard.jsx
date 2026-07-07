import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import "./StatCard.scss";

const StatCard = ({
  title,
  value,
  change,
  previous,
  icon: Icon,
  color = "blue",
  trend = "up",
  priority = "secondary",
  index = 0,
}) => {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <article
      className={`stat-card stat-card--${color} stat-card--${priority}`}
      style={{ "--card-index": index }}
    >
      <div className="stat-card__orb">
        <Icon size={20} />
      </div>

      <div className="stat-card__content">
        <span className="stat-card__title">{title}</span>
        <strong className="stat-card__value">{value}</strong>

        <div className="stat-card__meta">
          <span className={`stat-card__trend stat-card__trend--${trend}`}>
            <TrendIcon size={14} />
            {change}
          </span>

          <small>{previous}</small>
        </div>
      </div>
    </article>
  );
};

export default StatCard;
