import { Database, Save, Share2, Sparkles } from "lucide-react";

import { moduleReports } from "../../data/reportsMockData";
import AIInsightCard from "../AIInsightCard/AIInsightCard";
import ChartCard from "../ChartCard/ChartCard";
import ComparisonPanel from "../ComparisonPanel/ComparisonPanel";
import DataTable from "../DataTable/DataTable";
import ForecastPanel from "../ForecastPanel/ForecastPanel";
import ReportsEmptyState from "../ReportsEmptyState/ReportsEmptyState";
import ReportsKpiCard from "../ReportsKpiCard/ReportsKpiCard";
import "./ReportPageTemplate.scss";

const ReportPageTemplate = ({ type, controller }) => {
  const config = moduleReports[type] || moduleReports.sales;
  const metrics = controller.state.metrics.filter((metric) => config.kpis.includes(metric.id));

  return (
    <section className="report-page-template">
      <div className="report-page-template__hero">
        <div>
          <span className="reports-eyebrow">
            <Sparkles size={14} />
            {config.eyebrow}
          </span>
          <h2>{config.title}</h2>
          <p>{config.description}</p>
        </div>
        <div className="report-page-template__actions">
          <button type="button" onClick={() => controller.actions.saveReport(config.title, type)}>
            <Save size={15} />
            Save
          </button>
          <button type="button" onClick={() => controller.actions.setActiveModal("share")}>
            <Share2 size={15} />
            Share
          </button>
        </div>
      </div>

      <section className="reports-source-strip">
        <Database size={15} />
        <strong>Data Sources</strong>
        <span>{config.source}</span>
      </section>

      <div className="report-page-template__kpis">
        {metrics.map((metric, index) => (
          <ReportsKpiCard key={metric.id} metric={metric} index={index} onOpen={controller.actions.openReport} />
        ))}
      </div>

      <div className="report-page-template__main">
        {config.charts.map((title, index) => (
          <ChartCard
            key={title}
            title={title}
            type={["Area", "Bar", "Donut", "Timeline"][index] || "Line"}
            data={controller.state.charts}
            onDrill={() => controller.actions.setDrillLevel(Math.min(6, controller.state.drillLevel + 1))}
            onCompare={() => controller.actions.setComparisonMode("month-month")}
            onExport={() => controller.actions.exportReport("PDF", title)}
            onFullscreen={() => controller.actions.audit("widget changed", `Fullscreen ${title}`)}
          />
        ))}
      </div>

      <div className="report-page-template__side">
        <AIInsightCard insights={controller.state.insights} onAction={controller.actions.runAiAction} />
        <ForecastPanel metrics={metrics} />
        <ComparisonPanel
          comparison={controller.state.comparison}
          mode={controller.state.comparisonMode}
          onMode={controller.actions.setComparisonMode}
        />
      </div>

      {controller.state.rows.length ? (
        <DataTable title={config.tableTitle} rows={controller.state.rows} onOpen={controller.actions.openReport} />
      ) : (
        <ReportsEmptyState title="Report rows topilmadi" />
      )}
    </section>
  );
};

export default ReportPageTemplate;
