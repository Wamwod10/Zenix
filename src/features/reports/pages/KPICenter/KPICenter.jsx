import { Database, Target } from "lucide-react";

import { formatReportValue, formatSignedPercent } from "../../utils/reportsFormatters";
import "./KPICenter.scss";

const KPICenter = ({ controller }) => (
  <section className="kpi-center">
    <div className="reports-simple-view__head">
      <span className="reports-eyebrow">KPI Center</span>
      <h2>KPI formulas, source modules and goals</h2>
    </div>
    <div className="kpi-center__grid">
      {controller.state.metrics.map((metric) => (
        <article key={metric.id}>
          <div>
            <span><metric.icon size={17} /></span>
            <strong>{metric.title}</strong>
            <small>{metric.formula}</small>
          </div>
          <dl>
            <dt>Current</dt><dd>{formatReportValue(metric.value, metric.unit)}</dd>
            <dt>Previous</dt><dd>{formatReportValue(metric.previous, metric.unit)}</dd>
            <dt>Trend</dt><dd>{formatSignedPercent(metric.percent)}</dd>
            <dt>Goal</dt><dd>{formatReportValue(metric.goal, metric.unit)}</dd>
            <dt>Source</dt><dd><Database size={12} />{metric.source}</dd>
            <dt>Status</dt><dd><Target size={12} />{metric.status}</dd>
          </dl>
        </article>
      ))}
    </div>
  </section>
);

export default KPICenter;
