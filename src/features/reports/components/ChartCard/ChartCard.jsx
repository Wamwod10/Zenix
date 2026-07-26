import { Download, Expand, GitCompareArrows, Maximize2, RefreshCw, Sparkles } from "lucide-react";

import "./ChartCard.scss";

const polylinePoints = (series, key = "value") =>
  series.map((item, index) => `${(index / Math.max(1, series.length - 1)) * 100},${100 - item[key]}`).join(" ");

const ChartVisual = ({ type, data }) => {
  if (type === "Donut" || type === "Pie") {
    const total = data.slice(0, 4).reduce((sum, item) => sum + item.value, 0);
    let offset = 25;
    return (
      <div className="chart-card__donut" role="img" aria-label={`${type} chart`}>
        <svg viewBox="0 0 42 42">
          {data.slice(0, 4).map((item, index) => {
            const size = (item.value / total) * 75;
            const strokeDasharray = `${size} ${100 - size}`;
            const currentOffset = offset;
            offset -= size;
            return <circle key={item.label} cx="21" cy="21" r="15.9" style={{ "--slice": index }} strokeDasharray={strokeDasharray} strokeDashoffset={currentOffset} />;
          })}
        </svg>
        <strong>{Math.round(total / 4)}%</strong>
      </div>
    );
  }

  if (type === "Heat Map" || type === "Treemap") {
    return (
      <div className="chart-card__heat" role="img" aria-label={`${type} chart`}>
        {data.map((item, index) => (
          <span key={item.label} style={{ "--level": `${item.value}%`, "--tile": index }}>
            {item.label}
          </span>
        ))}
      </div>
    );
  }

  if (type === "Bar" || type === "Waterfall" || type === "Funnel" || type === "Comparison") {
    return (
      <div className={`chart-card__bars chart-card__bars--${type.toLowerCase()}`} role="img" aria-label={`${type} chart`}>
        {data.map((item, index) => (
          <span key={item.label} title={`${item.label}: ${item.value}`} style={{ "--bar-value": `${item.value}%`, "--bar-index": index }}>
            <i />
            <small>{item.label}</small>
          </span>
        ))}
      </div>
    );
  }

  return (
    <svg className="chart-card__line" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`${type} chart`}>
      <polyline className="chart-card__area" points={`0,100 ${polylinePoints(data)} 100,100`} />
      <polyline className="chart-card__compare" points={polylinePoints(data, "compare")} />
      <polyline className="chart-card__forecast" points={polylinePoints(data, "forecast")} />
      <polyline className="chart-card__main" points={polylinePoints(data)} />
    </svg>
  );
};

const ChartCard = ({ title, type = "Area", data, onDrill, onCompare, onExport, onFullscreen }) => (
  <article className="chart-card">
    <div className="chart-card__head">
      <div>
        <span className="reports-eyebrow">
          <Sparkles size={14} />
          {type}
        </span>
        <h3>{title}</h3>
      </div>
      <div className="chart-card__actions">
        <button type="button" aria-label="Refresh chart">
          <RefreshCw size={14} />
        </button>
        <button type="button" aria-label="Drill down chart" onClick={onDrill}>
          <Expand size={14} />
        </button>
        <button type="button" aria-label="Compare chart" onClick={onCompare}>
          <GitCompareArrows size={14} />
        </button>
        <button type="button" aria-label="Export chart" onClick={onExport}>
          <Download size={14} />
        </button>
        <button type="button" aria-label="Fullscreen chart" onClick={onFullscreen}>
          <Maximize2 size={14} />
        </button>
      </div>
    </div>

    <div className="chart-card__canvas">
      <ChartVisual type={type} data={data} />
    </div>

    <div className="chart-card__legend">
      <span><i className="is-main" />Current</span>
      <span><i className="is-compare" />Previous</span>
      <span><i className="is-forecast" />Forecast</span>
    </div>
  </article>
);

export default ChartCard;
