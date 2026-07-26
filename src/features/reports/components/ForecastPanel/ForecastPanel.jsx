import { LineChart, ShieldCheck, Sparkles } from "lucide-react";

import { formatReportValue } from "../../utils/reportsFormatters";
import "./ForecastPanel.scss";

const ForecastPanel = ({ metrics }) => (
  <article className="forecast-panel">
    <div className="forecast-panel__head">
      <span className="reports-eyebrow">
        <LineChart size={14} />
        Forecast
      </span>
      <strong>Confidence 94%</strong>
    </div>
    <div className="forecast-panel__grid">
      {metrics.slice(0, 4).map((item) => (
        <section key={item.id}>
          <span>{item.title}</span>
          <strong>{formatReportValue(item.forecast, item.unit)}</strong>
          <small>
            <ShieldCheck size={12} />
            30 days, risk {item.status === "healthy" ? "low" : "medium"}
          </small>
        </section>
      ))}
    </div>
    <p>
      <Sparkles size={14} />
      Forecast mavsumiy trend, branch impact va payment rhythm asosida deterministic hisoblanmoqda.
    </p>
  </article>
);

export default ForecastPanel;
