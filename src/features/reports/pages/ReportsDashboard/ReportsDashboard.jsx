import { Bolt, Save, Share2 } from "lucide-react";

import AIInsightCard from "../../components/AIInsightCard/AIInsightCard";
import BusinessHealthCard from "../../components/BusinessHealthCard/BusinessHealthCard";
import ChartCard from "../../components/ChartCard/ChartCard";
import ComparisonPanel from "../../components/ComparisonPanel/ComparisonPanel";
import DataTable from "../../components/DataTable/DataTable";
import ForecastPanel from "../../components/ForecastPanel/ForecastPanel";
import NotificationPanel from "../../components/NotificationPanel/NotificationPanel";
import ReportWidget from "../../components/ReportWidget/ReportWidget";
import ReportsKpiCard from "../../components/ReportsKpiCard/ReportsKpiCard";
import SmartSearch from "../../components/SmartSearch/SmartSearch";
import "./ReportsDashboard.scss";

const ReportsDashboard = ({ controller }) => (
  <section className="reports-dashboard-view">
    <section className="reports-dashboard-view__hero">
      <div>
        <span className="reports-eyebrow">
          <Bolt size={14} />
          Real-time BI workspace
        </span>
        <h2>Rahbar uchun bir ekranli Business Operating pulse</h2>
        <p>Revenue, profit, expense, inventory, customers, HR, AI summary va forecast bitta joyda.</p>
      </div>
      <div>
        <button type="button" onClick={() => controller.actions.saveReport("Director weekly report", "dashboard")}>
          <Save size={15} />
          Save dashboard
        </button>
        <button type="button" onClick={() => controller.actions.setActiveModal("share")}>
          <Share2 size={15} />
          Share
        </button>
      </div>
    </section>

    <div className="reports-dashboard-view__kpis">
      {controller.state.metrics.map((metric, index) => (
        <ReportsKpiCard key={metric.id} metric={metric} index={index} onOpen={controller.actions.openReport} />
      ))}
    </div>

    <div className="reports-dashboard-view__health">
      <BusinessHealthCard score={controller.state.metrics.find((item) => item.id === "health")?.value} metrics={controller.state.metrics} />
      <SmartSearch value={controller.state.search} onChange={controller.actions.setSearch} onRun={controller.actions.runSmartSearch} />
      <NotificationPanel
        notifications={controller.state.notifications}
        onOpen={controller.actions.openReport}
        onRead={controller.actions.markNotificationRead}
      />
    </div>

    <div className="reports-dashboard-view__widgets">
      {controller.state.widgetLayout.map((widget) => (
        <ReportWidget
          key={widget.id}
          widget={widget}
          data={controller.state.charts}
          onAction={controller.actions.mutateWidget}
          onCompare={() => controller.actions.setComparisonMode("branch-branch")}
          onExport={() => controller.actions.exportReport("PDF", widget.title)}
          onDrill={() => controller.actions.setDrillLevel(Math.min(6, controller.state.drillLevel + 1))}
        />
      ))}
    </div>

    <div className="reports-dashboard-view__analytics">
      <AIInsightCard insights={controller.state.insights} onAction={controller.actions.runAiAction} />
      <ForecastPanel metrics={controller.state.metrics} />
      <ComparisonPanel
        comparison={controller.state.comparison}
        mode={controller.state.comparisonMode}
        onMode={controller.actions.setComparisonMode}
      />
    </div>

    <ChartCard
      title="Goal progress"
      type="Funnel"
      data={controller.state.charts}
      onDrill={() => controller.actions.setDrillLevel(Math.min(6, controller.state.drillLevel + 1))}
      onCompare={() => controller.actions.setComparisonMode("year-year")}
      onExport={() => controller.actions.exportReport("PDF", "Goal progress")}
      onFullscreen={() => controller.actions.audit("widget changed", "Goal progress fullscreen")}
    />

    <DataTable title="Recent activities and branch performance" rows={controller.state.rows} onOpen={controller.actions.openReport} />
  </section>
);

export default ReportsDashboard;
