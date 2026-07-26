import { Sparkles } from "lucide-react";

import "./AIInventoryAssistant.scss";

const AIInventoryAssistant = ({ insights, onRunAction }) => (
  <section className="warehouse-ai">
    <div className="warehouse-ai__head">
      <span>
        <Sparkles size={15} />
        AI ombor yordamchisi
      </span>
      <strong>{insights.length} signal</strong>
    </div>

    <div className="warehouse-ai__list">
      {insights.map((insight) => (
        <article className="warehouse-ai__item" key={insight.id}>
          <div>
            <strong>{insight.title}</strong>
            <p>{insight.message}</p>
          </div>
          <button type="button" onClick={() => onRunAction(insight)}>
            {insight.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default AIInventoryAssistant;
