import { BadgePercent, Bot, Sparkles } from "lucide-react";

import "./AIRecommendation.scss";

const AIRecommendation = ({
  title = "AI tavsiyasi",
  message,
  actionLabel = "Tavsiya qo'llash",
  disabled = false,
  onApply,
}) => {
  return (
    <section className="pos-ai-recommendation">
      <div className="pos-ai-recommendation__content">
        <span className="pos-ai-recommendation__icon">
          <Bot size={19} />
        </span>

        <div className="pos-ai-recommendation__copy">
          <span className="pos-ai-recommendation__label">
            <Sparkles size={13} />
            {title}
          </span>

          <p>{message}</p>
        </div>
      </div>

      <button type="button" disabled={disabled} onClick={onApply}>
        <BadgePercent size={16} />
        {actionLabel}
      </button>
    </section>
  );
};

export default AIRecommendation;
