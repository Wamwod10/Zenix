import AIInsightCard from "../../components/AIInsightCard/AIInsightCard";
import ChartCard from "../../components/ChartCard/ChartCard";
import ForecastPanel from "../../components/ForecastPanel/ForecastPanel";
import "./AIAnalytics.scss";

const AIAnalytics = ({ controller }) => (
  <section className="reports-simple-view">
    <div className="reports-simple-view__head">
      <span className="reports-eyebrow">Aqlli tahlil</span>
      <h2>Biznes tavsiyalar markazi</h2>
      <p>Insight, action va resolve jarayonlari backend adapterga tayyor state lifecycle bilan boshqariladi.</p>
    </div>
    <AIInsightCard insights={controller.state.insights} onAction={controller.actions.runAiAction} />
    <ForecastPanel metrics={controller.state.metrics} />
    <ChartCard title="Tavsiya signallari" type="Heat Map" data={controller.state.charts} onRefresh={() => controller.actions.audit("AI insight viewed", "Trigger heatmap refresh")} onDrill={() => controller.actions.audit("AI insight viewed", "Trigger heatmap")} onCompare={() => controller.actions.setComparisonMode("month-month")} onExport={() => controller.actions.exportReport("JSON", "AI trigger rules")} onFullscreen={() => controller.actions.audit("widget changed", "AI fullscreen")} />
  </section>
);

export default AIAnalytics;
