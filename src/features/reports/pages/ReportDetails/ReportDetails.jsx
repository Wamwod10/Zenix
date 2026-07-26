import { Database, FileText, GitBranch, ShieldCheck } from "lucide-react";

import ChartCard from "../../components/ChartCard/ChartCard";
import DataTable from "../../components/DataTable/DataTable";
import DrillDownBreadcrumb from "../../components/DrillDownBreadcrumb/DrillDownBreadcrumb";
import { drillPath } from "../../utils/reportsCalculations";
import "./ReportDetails.scss";

const ReportDetails = ({ controller, reportId }) => (
  <section className="report-details">
    <div className="reports-simple-view__head">
      <span className="reports-eyebrow"><FileText size={14} />Report Details</span>
      <h2>{reportId}</h2>
      <p>Drill-down path: KPI → Year → Month → Week → Day → Transaction → Invoice.</p>
    </div>
    <DrillDownBreadcrumb level={controller.state.drillLevel} onLevel={controller.actions.setDrillLevel} />
    <div className="report-details__meta">
      <span><Database size={14} />Data Version reports-v1</span>
      <span><GitBranch size={14} />Source: All modules</span>
      <span><ShieldCheck size={14} />Permission checked</span>
      <span>Current level: {drillPath[controller.state.drillLevel]}</span>
    </div>
    <ChartCard title={`${reportId} drill-down`} type="Timeline" data={controller.state.charts} onDrill={() => controller.actions.setDrillLevel(Math.min(6, controller.state.drillLevel + 1))} onCompare={() => controller.actions.setComparisonMode("month-month")} onExport={() => controller.actions.exportReport("PDF", reportId)} onFullscreen={() => controller.actions.audit("widget changed", `${reportId} fullscreen`)} />
    <DataTable title={`${reportId} source rows`} rows={controller.state.rows} />
  </section>
);

export default ReportDetails;
