import StatusBadge from "../../components/StatusBadge/StatusBadge";

const AIFinance = ({ controller }) => (
  <section className="finance-view">
    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Deterministic AI engine</span>
          <h2>AI Finance insightlar</h2>
        </div>
        <StatusBadge status="success" label={`${controller.summary.healthScore}/100 health`} />
      </div>
      <div className="finance-card-grid">
        {controller.state.aiInsights.map((insight) => (
          <article className="finance-mini-card" key={insight.id}>
            <StatusBadge status={insight.severity} label={insight.type} />
            <strong>{insight.title}</strong>
            <span>{insight.message}</span>
            <div className="finance-row-actions">
              <button type="button" disabled={insight.status !== "open"} onClick={() => controller.actions.runAiAction(insight.id, insight.action)}>
                {insight.action}
              </button>
              <button type="button" disabled={insight.status !== "open"} onClick={() => controller.actions.runAiAction(insight.id, "dismiss")}>
                Dismiss
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="finance-panel">
      <div className="finance-panel__head">
        <div>
          <span>Enterprise edge cases</span>
          <h2>Himoya va resolution</h2>
        </div>
      </div>
      <div className="finance-card-grid">
        {controller.state.edgeCases.map((edgeCase) => (
          <article className="finance-mini-card" key={edgeCase.id}>
            <StatusBadge status={edgeCase.severity} label={edgeCase.type} />
            <strong>{edgeCase.message}</strong>
            <span>{edgeCase.resolution}</span>
            <button type="button" disabled={edgeCase.status === "resolved"} onClick={() => controller.actions.resolveEdgeCase(edgeCase.id)}>
              Resolve
            </button>
          </article>
        ))}
      </div>
    </section>
  </section>
);

export default AIFinance;
