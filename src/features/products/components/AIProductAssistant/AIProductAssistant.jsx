import { Sparkles } from "lucide-react";

const AIProductAssistant = ({ insights, onRun }) => (
  <section className="products-panel ai-product-assistant">
    <div className="products-panel__head">
      <div>
        <span>
          <Sparkles size={13} />
          Sun'iy idrok yordamchisi
        </span>
        <h2>Katalog uchun aqlli tavsiyalar</h2>
      </div>
    </div>
    <div className="products-ai-list">
      {insights.map((insight) => (
        <article key={insight.id}>
          <strong>{insight.title}</strong>
          <span>{insight.message}</span>
          <button type="button" className="products-mini-button" onClick={() => onRun(insight)}>
            {insight.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default AIProductAssistant;
