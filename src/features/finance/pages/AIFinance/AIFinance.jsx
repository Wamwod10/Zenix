import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatAiAction } from "../../utils/financeFormatters";

const AIFinance = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>AI moliya nazorati</span>
          <h2>AI Finance signallari</h2>
        </div>
        <StatusBadge status="success" label={`${controller.summary.healthScore}/100 salomatlik`} />
      </div>
      <div className="finance-card-grid">
        {controller.state.aiInsights.map((insight) => (
          <article className="finance-mini-card" key={insight.id}>
            <StatusBadge status={insight.severity} label={insight.type} />
            <strong>{insight.title}</strong>
            <span>{insight.message}</span>
            <div className="finance-row-actions">
              <button type="button" disabled={insight.status !== "open"} onClick={() => controller.actions.runAiAction(insight.id, insight.action)}>
                {formatAiAction(insight.action)}
              </button>
              <button type="button" disabled={insight.status !== "open"} onClick={() => controller.actions.runAiAction(insight.id, "dismiss")}>
                Yashirish
              </button>
            </div>
          </article>
        ))}
        {!controller.state.aiInsights.length && (
          <div className="finance-empty">Hozircha moliyaviy xavf aniqlanmadi.</div>
        )}
      </div>
    </section>

    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Himoya qoidalari</span>
          <h2>Risk va yechimlar</h2>
        </div>
      </div>
      <div className="finance-card-grid">
        {controller.state.edgeCases.map((edgeCase) => (
          <article className="finance-mini-card" key={edgeCase.id}>
            <StatusBadge status={edgeCase.severity} label={edgeCase.type} />
            <strong>{edgeCase.message}</strong>
            <span>{edgeCase.resolution}</span>
            <button type="button" disabled={edgeCase.status === "resolved"} onClick={() => controller.actions.resolveEdgeCase(edgeCase.id)}>
              Hal qilindi
            </button>
          </article>
        ))}
        {!controller.state.edgeCases.length && (
          <div className="finance-empty">Risk va edge-case yozuvlari topilmadi.</div>
        )}
      </div>
    </section>
  </section>
);

export default AIFinance;
