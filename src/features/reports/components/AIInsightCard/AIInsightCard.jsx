import { AlertTriangle, ArrowRight, CheckCircle2, Eye, Sparkles, X } from "lucide-react";

import "./AIInsightCard.scss";

const iconByType = {
  growth: Sparkles,
  risk: AlertTriangle,
  stock: AlertTriangle,
  customer: Eye,
  team: CheckCircle2,
};

const AIInsightCard = ({ insights, onAction }) => (
  <article className="ai-insight-card">
    <div className="ai-insight-card__head">
      <span className="reports-eyebrow">
        <Sparkles size={14} />
        Aqlli tahlil
      </span>
      <strong>{insights.filter((item) => item.status === "open").length} faol</strong>
    </div>

    <div className="ai-insight-card__list">
      {insights.map((item) => {
        const Icon = iconByType[item.type] || Sparkles;

        return (
          <section className={`ai-insight-card__item is-${item.priority}`} key={item.id}>
            <span>
              <Icon size={16} />
            </span>
            <div>
              <small>{item.priority}</small>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
              <div>
                <button type="button" onClick={() => onAction(item, "open")}>
                  {item.action}
                  <ArrowRight size={13} />
                </button>
                <button type="button" aria-label="Compare insight" onClick={() => onAction(item, "compare")}>
                  Taqqoslash
                </button>
                <button type="button" aria-label="Dismiss insight" onClick={() => onAction(item, "dismiss")}>
                  <X size={13} />
                </button>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  </article>
);

export default AIInsightCard;
