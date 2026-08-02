import { formatMoney } from "../../utils/financeFormatters";

import "./FinanceCharts.scss";

const normalize = (value, max) => Math.max(6, Math.round((Number(value || 0) / Math.max(max, 1)) * 100));

export const FinanceBarChart = ({ rows = [], title }) => {
  const max = Math.max(...rows.map((item) => Math.abs(Number(item.value || 0))), 1);

  return (
    <div className="finance-chart" role="img" aria-label={title}>
      <div className="finance-chart__plot">
        {rows.map((item) => {
          const height = normalize(Math.abs(item.value), max);

          return (
            <div className="finance-chart__bar" key={item.label}>
              <svg viewBox="0 0 28 112" aria-hidden="true">
                <rect x="5" y={112 - height} width="18" height={height} rx="7" />
              </svg>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const FinanceTrendChart = ({ rows = [], title }) => {
  const max = Math.max(...rows.map((item) => Math.abs(Number(item.value || 0))), 1);
  const points = rows
    .map((item, index) => {
      const x = rows.length <= 1 ? 6 : 6 + (index * 188) / (rows.length - 1);
      const y = 104 - normalize(Math.abs(item.value), max);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="finance-trend" role="img" aria-label={title}>
      <svg viewBox="0 0 200 112" preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {rows.map((item, index) => {
          const x = rows.length <= 1 ? 6 : 6 + (index * 188) / (rows.length - 1);
          const y = 104 - normalize(Math.abs(item.value), max);
          return <circle key={item.label} cx={x} cy={y} r="4" />;
        })}
      </svg>
      <div>
        {rows.map((item) => (
          <span key={item.label}>{item.label}: {formatMoney(item.value)}</span>
        ))}
      </div>
    </div>
  );
};
