import { useMemo, useState } from "react";
import { Download, Expand, GitCompareArrows, Maximize2, RefreshCw, Sparkles } from "lucide-react";

import { getChartBounds, scaleChartValue } from "../../utils/reportsCalculations";
import "./ChartCard.scss";

const seriesConfig = {
  value: { label: "Joriy davr", className: "chart-card__main" },
  compare: { label: "Oldingi davr", className: "chart-card__compare" },
  forecast: { label: "Prognoz", className: "chart-card__forecast" },
};

const chartKeys = Object.keys(seriesConfig);

const polylinePoints = (series, key, min, max) =>
  series.map((item, index) => `${(index / Math.max(1, series.length - 1)) * 100},${scaleChartValue(item[key], min, max)}`).join(" ");

const ChartTooltip = ({ item, activeKeys }) => {
  if (!item) return null;
  return (
    <div className="chart-card__tooltip" role="status">
      <strong>{item.label}</strong>
      {activeKeys.map((key) => (
        <span key={key}>{seriesConfig[key].label}: {item[key]}</span>
      ))}
    </div>
  );
};

const ChartVisual = ({ type, data, activeKeys }) => {
  const [hovered, setHovered] = useState(null);
  const bounds = useMemo(() => getChartBounds(data, activeKeys), [activeKeys, data]);

  if (!data?.length) {
    return <div className="chart-card__empty">Grafik uchun ma'lumot topilmadi.</div>;
  }

  if (type === "Donut" || type === "Pie") {
    const slices = data.slice(0, 4);
    const total = slices.reduce((sum, item) => sum + Math.max(0, Number(item.value) || 0), 0);
    if (!total) return <div className="chart-card__empty">Segmentlar qiymati 0.</div>;
    let offset = 25;
    return (
      <div className="chart-card__donut" role="img" aria-label={`${type} chart`}>
        <svg viewBox="0 0 42 42">
          {slices.map((item, index) => {
            const size = (Math.max(0, item.value) / total) * 75;
            const strokeDasharray = `${size} ${100 - size}`;
            const currentOffset = offset;
            offset -= size;
            return <circle key={item.label} cx="21" cy="21" r="15.9" style={{ "--slice": index }} strokeDasharray={strokeDasharray} strokeDashoffset={currentOffset} />;
          })}
        </svg>
        <strong>{total.toLocaleString("uz-UZ")}</strong>
        <small>jami</small>
      </div>
    );
  }

  if (type === "Heat Map" || type === "Treemap") {
    return (
      <div className="chart-card__heat" role="img" aria-label={`${type} chart`}>
        {data.map((item, index) => (
          <span
            key={item.label}
            style={{ "--level": `${scaleChartValue(item.value, bounds.min, bounds.max, false)}%`, "--tile": index }}
            onMouseEnter={() => setHovered(item)}
            onMouseLeave={() => setHovered(null)}
          >
            {item.label}
          </span>
        ))}
        <ChartTooltip item={hovered} activeKeys={["value"]} />
      </div>
    );
  }

  if (type === "Bar" || type === "Waterfall" || type === "Funnel" || type === "Comparison") {
    return (
      <div className={`chart-card__bars chart-card__bars--${type.toLowerCase()}`} role="img" aria-label={`${type} chart`}>
        {data.map((item, index) => (
          <span
            key={item.label}
            style={{ "--bar-value": `${scaleChartValue(item.value, bounds.min, bounds.max, false)}%`, "--bar-index": index }}
            onMouseEnter={() => setHovered(item)}
            onMouseLeave={() => setHovered(null)}
          >
            <i />
            <small>{item.label}</small>
          </span>
        ))}
        <ChartTooltip item={hovered} activeKeys={["value"]} />
      </div>
    );
  }

  return (
    <div className="chart-card__line-wrap">
      <svg className="chart-card__line" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`${type} chart`}>
        <g className="chart-card__grid" aria-hidden="true">
          {[25, 50, 75].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} />)}
        </g>
        {activeKeys.includes("value") && <polyline className="chart-card__area" points={`0,100 ${polylinePoints(data, "value", bounds.min, bounds.max)} 100,100`} />}
        {activeKeys.map((key) => (
          <polyline key={key} className={seriesConfig[key].className} points={polylinePoints(data, key, bounds.min, bounds.max)} />
        ))}
      </svg>
      <div className="chart-card__axis">
        <span>{bounds.max}</span>
        <span>{bounds.min}</span>
      </div>
    </div>
  );
};

const ChartCard = ({ title, type = "Area", data, loading = false, error = "", onRefresh, onDrill, onCompare, onExport, onFullscreen }) => {
  const [activeKeys, setActiveKeys] = useState(chartKeys);
  const [fullscreen, setFullscreen] = useState(false);

  const toggleSeries = (key) => {
    setActiveKeys((current) => {
      if (current.includes(key) && current.length === 1) return current;
      return current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
    });
  };

  const renderBody = () => (
    <>
      <div className="chart-card__canvas">
        {loading ? <div className="chart-card__empty">Grafik yangilanmoqda...</div> : error ? <div className="chart-card__empty">{error}</div> : <ChartVisual type={type} data={data} activeKeys={activeKeys} />}
      </div>

      <div className="chart-card__legend">
        {chartKeys.map((key) => (
          <button key={key} type="button" className={activeKeys.includes(key) ? "is-active" : ""} onClick={() => toggleSeries(key)}>
            <i className={`is-${key === "value" ? "main" : key}`} />
            {seriesConfig[key].label}
          </button>
        ))}
      </div>
    </>
  );

  return (
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
          <button type="button" title="Grafikni yangilash" aria-label="Grafikni yangilash" onClick={onRefresh}>
            <RefreshCw size={14} />
          </button>
          <button type="button" title="Drill-down" aria-label="Drill-down chart" onClick={onDrill}>
            <Expand size={14} />
          </button>
          <button type="button" title="Taqqoslash" aria-label="Grafikni taqqoslash" onClick={onCompare}>
            <GitCompareArrows size={14} />
          </button>
          <button type="button" title="Grafikni eksport qilish" aria-label="Grafikni eksport qilish" onClick={onExport}>
            <Download size={14} />
          </button>
          <button type="button" title="To'liq ekran" aria-label="Grafikni to'liq ekranda ochish" onClick={() => { setFullscreen(true); onFullscreen?.(); }}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {renderBody()}

      {fullscreen && (
        <div className="reports-modal chart-card__fullscreen" role="dialog" aria-modal="true" aria-label={`${title} to'liq ekran`}>
          <button className="reports-modal__backdrop" type="button" aria-label="To'liq ekranni yopish" onClick={() => setFullscreen(false)} />
          <section className="reports-modal__panel">
            <div className="reports-modal__head">
              <div>
                <span>{type}</span>
                <h2>{title}</h2>
              </div>
              <button type="button" onClick={() => setFullscreen(false)}>Yopish</button>
            </div>
            {renderBody()}
          </section>
        </div>
      )}
    </article>
  );
};

export default ChartCard;
