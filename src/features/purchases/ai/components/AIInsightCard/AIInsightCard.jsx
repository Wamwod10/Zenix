import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Gem,
  Lightbulb,
  Pin,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

import { Badge } from "../../../../../components/ui/Badge/Badge";
import {
  AI_CATEGORY_LABELS,
  AI_INSIGHT_TYPE_LABELS,
  AI_INSIGHT_TYPE_TONES,
  AI_PRIORITY_LABELS,
  AI_PRIORITY_TONES,
  AI_RISK_LABELS,
  AI_RISK_TONES,
} from "../../aiConstants";

import "./AIInsightCard.scss";

const TYPE_ICONS = {
  recommendation: Sparkles,
  warning: AlertTriangle,
  prediction: TrendingUp,
  opportunity: Gem,
  insight: Lightbulb,
  risk: ShieldAlert,
};

const AIInsightCard = ({ insight, onPin, onComplete, onDismiss, onRestore }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const Icon = TYPE_ICONS[insight.type] || Sparkles;

  return (
    <article
      className={[
        "ai-insight-card",
        `ai-insight-card--${AI_INSIGHT_TYPE_TONES[insight.type] || "info"}`,
        insight.pinned ? "ai-insight-card--pinned" : "",
        insight.completed ? "ai-insight-card--completed" : "",
        insight.dismissed ? "ai-insight-card--dismissed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="ai-insight-card__icon">
        <Icon size={18} />
      </div>

      <div className="ai-insight-card__body">
        <div className="ai-insight-card__badges">
          <Badge tone={AI_INSIGHT_TYPE_TONES[insight.type] || "info"} size="sm">
            {AI_INSIGHT_TYPE_LABELS[insight.type] || insight.type}
          </Badge>
          <Badge tone="neutral" size="sm">
            {AI_CATEGORY_LABELS[insight.category] || insight.category}
          </Badge>
          {insight.riskLevel && (
            <Badge tone={AI_RISK_TONES[insight.riskLevel]} size="sm">
              {AI_RISK_LABELS[insight.riskLevel]}
            </Badge>
          )}
          <Badge tone={AI_PRIORITY_TONES[insight.priority]} size="sm">
            {AI_PRIORITY_LABELS[insight.priority]}
          </Badge>
          <span className="ai-insight-card__confidence">
            Ishonch: {insight.confidence}%
          </span>
        </div>

        <h4 className="ai-insight-card__title">{insight.title}</h4>
        <p className="ai-insight-card__message">{insight.message}</p>

        <button
          type="button"
          className="ai-insight-card__reasoning-toggle"
          onClick={() => setExpanded((current) => !current)}
        >
          <ChevronDown
            size={13}
            style={{ transform: expanded ? "rotate(180deg)" : "none" }}
          />
          Sabab-oqibat
        </button>

        {expanded && <p className="ai-insight-card__reasoning">{insight.reasoning}</p>}

        <div className="ai-insight-card__footer">
          <div className="ai-insight-card__actions">
            {insight.suggestedActions?.map((action) => (
              <button
                type="button"
                key={action.label}
                className="ai-insight-card__action-btn"
                onClick={() => action.to && navigate(action.to)}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="ai-insight-card__controls">
            {insight.dismissed ? (
              <button
                type="button"
                title="Tiklash"
                aria-label="Tiklash"
                onClick={() => onRestore?.(insight)}
              >
                <RotateCcw size={14} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  title={insight.pinned ? "Belgini olib tashlash" : "Belgilash"}
                  aria-label="Belgilash"
                  className={insight.pinned ? "is-active" : ""}
                  onClick={() => onPin?.(insight)}
                >
                  <Pin size={14} />
                </button>
                <button
                  type="button"
                  title={insight.completed ? "Bajarilmagan deb belgilash" : "Bajarildi deb belgilash"}
                  aria-label="Bajarildi"
                  className={insight.completed ? "is-active" : ""}
                  onClick={() => onComplete?.(insight)}
                >
                  <CheckCircle2 size={14} />
                </button>
                <button
                  type="button"
                  title="Yopish"
                  aria-label="Yopish"
                  onClick={() => onDismiss?.(insight)}
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default AIInsightCard;
