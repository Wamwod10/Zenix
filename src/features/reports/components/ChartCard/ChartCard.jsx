import { useState } from "react";
import { Download, Expand, GitCompareArrows, Maximize2, RefreshCw, Sparkles } from "lucide-react";

import "./ChartCard.scss";

const seriesConfig = {
  value: { label: "Joriy davr" },
  compare: { label: "Oldingi davr" },
  forecast: { label: "Prognoz" },
};

const chartKeys = Object.keys(seriesConfig);

const toNumeric = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatMetric = (value) => {
  const number = toNumeric(value);
  if (number == null) return value ?? "-";
  return number.toLocaleString("uz-UZ");
};

const AnalyticsVisual = ({ data, activeKeys }) => {
  if (!data?.length) {
    return <div className="chart-card__empty">Analitika uchun ma'lumot topilmadi.</div>;
  }

  const primaryValues = data.map((item) => toNumeric(item.value)).filter((value) => value != null);
  const total = primaryValues.reduce((sum, value) => sum + value, 0);
  const average = primaryValues.length ? total / primaryValues.length : 0;
  const maximum = primaryValues.length ? Math.max(...primaryValues) : 0;
  const minimum = primaryValues.length ? Math.min(...primaryValues) : 0;

  const summaries = [
    { label: "Jami", value: total },
    { label: "O'rtacha", value: average },
    { label: "Eng yuqori", value: maximum },
    { label: "Eng past", value: minimum },
  ];

  return (
    <div className="chart-card__analytics">
      <div className="chart-card__summary">
        {summaries.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{formatMetric(item.value)}</strong>
          </article>
        ))}
      </div>

      <div className="chart-card__rows">
        {data.slice(0, 12).map((item, index) => (
          <article key={`${item.label}-${index}`}>
            <span>{item.label}</span>
            {activeKeys.map((key) => (
              <strong key={key}>
                <small>{seriesConfig[key].label}</small>
                {formatMetric(item[key])}
              </strong>
            ))}
          </article>
        ))}
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
        {loading ? (
          <div className="chart-card__empty">Analitika yangilanmoqda...</div>
        ) : error ? (
          <div className="chart-card__empty">{error}</div>
        ) : (
          <AnalyticsVisual data={data} activeKeys={activeKeys} />
        )}
      </div>

      <div className="chart-card__legend">
        {chartKeys.map((key) => (
          <button key={key} type="button" className={activeKeys.includes(key) ? "is-active" : ""} onClick={() => toggleSeries(key)}>
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
          <button type="button" title="Analitikani yangilash" aria-label="Analitikani yangilash" onClick={onRefresh}>
            <RefreshCw size={14} />
          </button>
          <button type="button" title="Drill-down" aria-label="Analitika drill-down" onClick={onDrill}>
            <Expand size={14} />
          </button>
          <button type="button" title="Taqqoslash" aria-label="Analitikani taqqoslash" onClick={onCompare}>
            <GitCompareArrows size={14} />
          </button>
          <button type="button" title="Analitikani eksport qilish" aria-label="Analitikani eksport qilish" onClick={onExport}>
            <Download size={14} />
          </button>
          <button type="button" title="To'liq ekran" aria-label="Analitikani to'liq ekranda ochish" onClick={() => { setFullscreen(true); onFullscreen?.(); }}>
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
