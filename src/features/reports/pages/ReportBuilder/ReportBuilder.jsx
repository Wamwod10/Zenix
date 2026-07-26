import { Save, Sparkles } from "lucide-react";

import ChartCard from "../../components/ChartCard/ChartCard";
import DataTable from "../../components/DataTable/DataTable";
import { metricCatalog } from "../../data/reportsMockData";
import "./ReportBuilder.scss";

const options = {
  dataSource: ["All modules", "POS", "Warehouse", "CRM", "Finance", "HR", "Purchases"],
  chartType: ["Line", "Area", "Bar", "Donut", "Pie", "Heat Map", "Timeline", "Comparison", "Forecast", "Waterfall", "Funnel", "Treemap"],
  grouping: ["Branch", "Product", "Employee", "Supplier", "Customer", "Department"],
  sorting: ["Value desc", "Value asc", "Change desc", "Risk desc"],
  layout: ["Dashboard", "Executive", "Table first", "Chart first"],
};

const ReportBuilder = ({ controller }) => {
  const builder = controller.state.builder;
  const update = (key, value) => controller.actions.setBuilder((current) => ({ ...current, [key]: value }));

  return (
    <section className="report-builder">
      <div className="reports-simple-view__head">
        <span className="reports-eyebrow"><Sparkles size={14} />Report Builder</span>
        <h2>Custom report composer</h2>
      </div>
      <div className="report-builder__layout">
        <form className="report-builder__form">
          <label><span>Name</span><input value={builder.name} onChange={(event) => update("name", event.target.value)} /></label>
          <label><span>KPI</span><select value={builder.kpi} onChange={(event) => update("kpi", event.target.value)}>{metricCatalog.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
          {Object.entries(options).map(([key, values]) => (
            <label key={key}><span>{key}</span><select value={builder[key]} onChange={(event) => update(key, event.target.value)}>{values.map((item) => <option key={item}>{item}</option>)}</select></label>
          ))}
          <label className="report-builder__wide"><span>Columns</span><input value={builder.columns.join(", ")} onChange={(event) => update("columns", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></label>
          <label className="report-builder__wide"><span>Widgets</span><input value={builder.widgets.join(", ")} onChange={(event) => update("widgets", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></label>
          <button type="button" onClick={() => controller.actions.saveReport(builder.name, "builder")}>
            <Save size={15} />
            Saqlash
          </button>
        </form>
        <div className="report-builder__preview">
          <ChartCard title={builder.name} type={builder.chartType} data={controller.state.charts} onDrill={() => controller.actions.setDrillLevel(1)} onCompare={() => controller.actions.setComparisonMode("month-month")} onExport={() => controller.actions.exportReport("PDF", builder.name)} onFullscreen={() => controller.actions.audit("widget changed", "Builder preview fullscreen")} />
          <DataTable title="Realtime preview" rows={controller.state.rows} />
        </div>
      </div>
    </section>
  );
};

export default ReportBuilder;
