import AIInsightCard from "../../components/AIInsightCard/AIInsightCard";
import ChartCard from "../../components/ChartCard/ChartCard";
import ForecastPanel from "../../components/ForecastPanel/ForecastPanel";
import "./AIAnalytics.scss";

const AIAnalytics = ({ controller }) => (
  <section className="reports-simple-view">
    <div className="reports-simple-view__head">
      <span className="reports-eyebrow">AI Analytics</span>
      <h2>Deterministic AI Business Advisor</h2>
      <p>Real backend AI ulanmaguncha insight, action va resolve flowlari frontend state bilan ishlaydi.</p>
    </div>
    <AIInsightCard insights={controller.state.insights} onAction={controller.actions.runAiAction} />
    <ForecastPanel metrics={controller.state.metrics} />
    <ChartCard title="AI trigger rules" type="Heat Map" data={controller.state.charts} onDrill={() => controller.actions.audit("AI insight viewed", "Trigger heatmap")} onCompare={() => controller.actions.setComparisonMode("month-month")} onExport={() => controller.actions.exportReport("JSON", "AI trigger rules")} onFullscreen={() => controller.actions.audit("widget changed", "AI fullscreen")} />
  </section>
);

export default AIAnalytics;
