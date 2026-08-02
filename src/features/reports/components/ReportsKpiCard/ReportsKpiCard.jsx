import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";

import { clampNumber, formatReportValue, formatSignedPercent } from "../../utils/reportsFormatters";
import "./ReportsKpiCard.scss";

const ReportsKpiCard = ({ metric, index = 0, onOpen }) => {
  const Icon = metric.icon;
  const TrendIcon = metric.trend === "down" ? ArrowDownRight : ArrowUpRight;
  const progress = clampNumber(metric.progress);

  return (
    <button
      className={`reports-kpi-card reports-kpi-card--${metric.status}`}
      style={{ "--card-index": index, "--progress": `${progress}%` }}
      type="button"
      onClick={() => onOpen(metric.report)}
      aria-label={`${metric.title} reportni ochish`}
    >
      <span className="reports-kpi-card__orb">
        <Icon size={20} />
      </span>

      <span className="reports-kpi-card__content">
        <span className="reports-kpi-card__title">{metric.title}</span>
        <strong>{formatReportValue(metric.value, metric.unit)}</strong>
        <span className="reports-kpi-card__meta">
          <em className={`is-${metric.trend}`}>
            <TrendIcon size={14} />
            {formatSignedPercent(metric.percent)}
          </em>
          <small>Maqsad {progress}%</small>
        </span>
      </span>

      <span className="reports-kpi-card__progress" aria-label={`Maqsad bajarilishi ${progress}%`}>
        <i />
      </span>

      <span className="reports-kpi-card__ai">
        <Sparkles size={13} />
        {metric.ai}
      </span>

      <span className="reports-kpi-card__foot">
        <small>{metric.source}</small>
        <small>{metric.lastUpdated}</small>
      </span>
    </button>
  );
};

export default ReportsKpiCard;
