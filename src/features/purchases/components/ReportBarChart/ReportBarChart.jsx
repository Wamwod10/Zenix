// PDF 73 (Interactive Charts / Trend Analysis): yengil CSS-asosli ustunli
// grafik — loyihada chart kutubxonasi ishlatilmaydi (Dashboard modulidagi
// SalesChart/RevenueChart bilan bir xil --bar-height CSS o'zgaruvchisi
// yondashuvi), shu sabab Purchases doirasida mustaqil, xuddi shu uslubda
// qayta quriladi.

import "./ReportBarChart.scss";

const ReportBarChart = ({ data = [], valueFormatter = (value) => value, onBarClick, tone = "primary" }) => {
  const max = Math.max(...data.map((entry) => entry.value), 1);

  if (!data.length) {
    return <p className="report-bar-chart__empty">Ma'lumot yo'q.</p>;
  }

  return (
    <div className={`report-bar-chart report-bar-chart--${tone}`}>
      {data.map((entry, index) => {
        const percent = Math.max((entry.value / max) * 100, entry.value > 0 ? 4 : 0);

        return (
          <div
            className={[
              "report-bar-chart__col",
              onBarClick ? "report-bar-chart__col--clickable" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={entry.key || entry.label || index}
            onClick={onBarClick ? () => onBarClick(entry) : undefined}
          >
            <span className="report-bar-chart__value">{valueFormatter(entry.value)}</span>
            <span className="report-bar-chart__track">
              <span className="report-bar-chart__fill" style={{ height: `${percent}%` }} />
            </span>
            <span className="report-bar-chart__label">{entry.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ReportBarChart;
