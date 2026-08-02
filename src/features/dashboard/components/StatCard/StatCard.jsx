import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./StatCard.scss";

const StatCard = ({
  title,
  value,
  change,
  previous,
  icon: Icon,
  color = "blue",
  trend = null,
  priority = "secondary",
  index = 0,
  path,
}) => {
  const navigate = useNavigate();
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;
  const isClickable = Boolean(path);

  const openPath = () => {
    if (path) navigate(path);
  };

  return (
    <article
      className={`stat-card stat-card--${color} stat-card--${priority} ${
        isClickable ? "stat-card--clickable" : ""
      }`}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      style={{ "--card-index": index }}
      onClick={isClickable ? openPath : undefined}
      onKeyDown={
        isClickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openPath();
              }
            }
          : undefined
      }
    >
      <div className="stat-card__orb">
        <Icon size={20} />
      </div>

      <div className="stat-card__content">
        <span className="stat-card__title">{title}</span>
        <strong className="stat-card__value">{value}</strong>

        <div className="stat-card__meta">
          {trend ? (
            <span className={`stat-card__trend stat-card__trend--${trend}`}>
              <TrendIcon size={14} />
              {change}
            </span>
          ) : (
            <span className="stat-card__trend stat-card__trend--neutral">
              {change}
            </span>
          )}

          <small>{previous}</small>
        </div>
      </div>
    </article>
  );
};

export default StatCard;
