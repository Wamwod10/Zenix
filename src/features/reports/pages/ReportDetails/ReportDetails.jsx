import { Database, FileText, ShieldCheck } from "lucide-react";

import ChartCard from "../../components/ChartCard/ChartCard";
import DataTable from "../../components/DataTable/DataTable";
import DrillDownBreadcrumb from "../../components/DrillDownBreadcrumb/DrillDownBreadcrumb";
import { drillPath } from "../../utils/reportsCalculations";
import { getReportTitle } from "../../utils/reportsFormatters";
import "./ReportDetails.scss";

const ReportDetails = ({ controller, reportId }) => {
  const title = getReportTitle(reportId) || "Report tafsiloti";

  return (
    <section className="report-details">
      <div className="reports-simple-view__head">
        <span className="reports-eyebrow"><FileText size={14} />Hisobot tafsiloti</span>
        <h2>{title}</h2>
        <p>Tanlangan hisobot bo'yicha drill-down, grafik va manba qatorlari.</p>
      </div>
      <DrillDownBreadcrumb level={controller.state.drillLevel} onLevel={controller.actions.setDrillLevel} />
      <div className="report-details__meta">
        <span><Database size={14} />Ma'lumotlar adapter orqali olindi</span>
        <span><ShieldCheck size={14} />Ruxsat tekshirildi</span>
        <span>Joriy daraja: {drillPath[controller.state.drillLevel]}</span>
      </div>
      <details className="report-details__debug">
        <summary>Developer tafsilotlari</summary>
        <span>Data Version: reports-v{controller.state.backendPayload.storageVersion || 2}</span>
        <span>Source: all-modules adapter</span>
        <span>Report ID: {reportId}</span>
      </details>
      <ChartCard
        title={`${title} drill-down`}
        type="Timeline"
        data={controller.state.charts}
        onRefresh={() => controller.actions.audit("report opened", `${reportId} details refreshed`)}
        onDrill={() => controller.actions.setDrillLevel(Math.min(6, controller.state.drillLevel + 1))}
        onCompare={() => controller.actions.setComparisonMode("month-month")}
        onExport={() => controller.actions.exportReport("PDF", reportId)}
        onFullscreen={() => controller.actions.audit("widget changed", `${reportId} fullscreen`)}
      />
      <DataTable title={`${title} manba qatorlari`} rows={controller.state.rows} onReset={controller.actions.resetFilters} />
    </section>
  );
};

export default ReportDetails;
