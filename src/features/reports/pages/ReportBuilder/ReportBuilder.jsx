import { Save, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

import ChartCard from "../../components/ChartCard/ChartCard";
import DataTable from "../../components/DataTable/DataTable";
import ReportsField from "../../components/ReportsField/ReportsField";
import { metricCatalog } from "../../data/reportsMockData";
import "./ReportBuilder.scss";

const options = {
  dataSource: ["All modules", "POS", "Warehouse", "CRM", "Finance", "HR", "Purchases"],
  chartType: ["Line", "Area", "Bar", "Donut", "Pie", "Heat Map", "Timeline", "Comparison", "Forecast", "Waterfall", "Funnel", "Treemap"],
  grouping: ["Branch", "Product", "Employee", "Supplier", "Customer", "Department"],
  sorting: ["Value desc", "Value asc", "Change desc", "Risk desc"],
  layout: ["Dashboard", "Executive", "Table first", "Chart first"],
};

const labels = {
  dataSource: "Ma'lumot manbasi",
  chartType: "Grafik turi",
  grouping: "Guruhlash",
  sorting: "Saralash",
  layout: "Layout",
};

const ReportBuilder = ({ controller }) => {
  const builder = controller.state.builder;
  const [columnDraft, setColumnDraft] = useState("");
  const [widgetDraft, setWidgetDraft] = useState("");
  const duplicateName = controller.state.savedReports.some((item) => item.name.toLowerCase() === builder.name.trim().toLowerCase());
  const nameError = !builder.name.trim() ? "Hisobot nomi majburiy" : duplicateName ? "Bu nom band" : "";
  const update = (key, value) => controller.actions.setBuilder((current) => ({ ...current, [key]: value }));
  const selectedMetric = useMemo(() => metricCatalog.find((item) => item.id === builder.kpi), [builder.kpi]);

  const addChip = (key, value, clear) => {
    const next = value.trim();
    if (!next) return;
    update(key, [...new Set([...builder[key], next])]);
    clear("");
  };

  const removeChip = (key, value) => update(key, builder[key].filter((item) => item !== value));

  return (
    <section className="report-builder">
      <div className="reports-simple-view__head">
        <span className="reports-eyebrow"><Sparkles size={14} />Hisobot konstruktori</span>
        <h2>Custom hisobot yaratish</h2>
      </div>
      <div className="report-builder__layout">
        <form className="report-builder__form">
          <ReportsField label="Hisobot nomi" value={builder.name} onChange={(value) => update("name", value)} error={nameError} />
          <ReportsField label="Asosiy KPI" type="select" value={builder.kpi} onChange={(value) => update("kpi", value)} options={metricCatalog.map((item) => ({ value: item.id, label: item.title }))} />
          {Object.entries(options).map(([key, values]) => (
            <ReportsField key={key} label={labels[key]} type="select" value={builder[key]} onChange={(value) => update(key, value)} options={values} />
          ))}

          {[
            ["columns", "Ustunlar", columnDraft, setColumnDraft],
            ["widgets", "Widgetlar", widgetDraft, setWidgetDraft],
          ].map(([key, label, draft, setDraft]) => (
            <div className="report-builder__chips" key={key}>
              <span>{label}</span>
              <div>
                {builder[key].map((item) => (
                  <button key={item} type="button" onClick={() => removeChip(key, item)}>
                    {item}
                    <X size={12} />
                  </button>
                ))}
              </div>
              <label>
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addChip(key, draft, setDraft);
                    }
                  }}
                  placeholder={`${label} qo'shish`}
                />
                <button type="button" onClick={() => addChip(key, draft, setDraft)}>Qo'shish</button>
              </label>
            </div>
          ))}

          <button type="button" disabled={Boolean(nameError)} onClick={() => controller.actions.saveReport(builder.name, "builder")}>
            <Save size={15} />
            Saqlash
          </button>
        </form>
        <div className="report-builder__preview">
          <ChartCard
            title={`${builder.name || "Yangi hisobot"} / ${selectedMetric?.title || "KPI"}`}
            type={builder.chartType}
            data={controller.state.charts}
            onRefresh={() => controller.actions.audit("report opened", "Builder preview refreshed")}
            onDrill={() => controller.actions.setDrillLevel(1)}
            onCompare={() => controller.actions.setComparisonMode("month-month")}
            onExport={() => controller.actions.exportReport("PDF", builder.name)}
            onFullscreen={() => controller.actions.audit("widget changed", "Builder preview fullscreen")}
          />
          <DataTable title="Jonli preview" rows={controller.state.rows} onReset={controller.actions.resetFilters} />
        </div>
      </div>
    </section>
  );
};

export default ReportBuilder;
