import { formatMoney } from "../../utils/financeFormatters";

import "./FinanceCharts.scss";

const buildSummary = (rows = []) => {
  const values = rows.map((item) => Number(item.value || 0));
  const total = values.reduce((sum, value) => sum + value, 0);
  const positive = values.filter((value) => value > 0).reduce((sum, value) => sum + value, 0);
  const negative = Math.abs(values.filter((value) => value < 0).reduce((sum, value) => sum + value, 0));
  const average = values.length ? total / values.length : 0;

  return [
    { label: "Jami", value: total },
    { label: "Kirim", value: positive },
    { label: "Chiqim", value: negative },
    { label: "O'rtacha", value: average },
  ];
};

const FinanceAnalyticsBlock = ({ rows = [], title, mode = "trend" }) => {
  const visibleRows = rows.slice(-12);

  if (!rows.length) {
    return (
      <div className="finance-analytics-block">
        <p className="finance-analytics-block__empty">{title} uchun ma'lumot yo'q.</p>
      </div>
    );
  }

  const summary = buildSummary(rows);
  return (
    <div className={`finance-analytics-block finance-analytics-block--${mode}`} aria-label={title}>
      <div className="finance-analytics-block__head">
        <h3>{title}</h3>
        <span>{rows.length} yozuv</span>
      </div>

      <div className="finance-analytics-block__summary">
        {summary.map((item) => (
          <article className={Number(item.value || 0) < 0 ? "is-negative" : "is-positive"} key={item.label}>
            <span>{item.label}</span>
            <strong>{formatMoney(item.value)}</strong>
          </article>
        ))}
      </div>

      <div className="finance-analytics-block__rows">
        {visibleRows.map((item, index) => (
          <article className={Number(item.value || 0) < 0 ? "is-negative" : "is-positive"} key={`${item.label}-${index}`}>
            <span>{item.label}</span>
            <strong>{formatMoney(item.value)}</strong>
            <em>{Number(item.value || 0) >= 0 ? "Kirim" : "Chiqim"}</em>
          </article>
        ))}
      </div>
    </div>
  );
};

export const FinanceBarChart = ({ rows = [], title }) => (
  <FinanceAnalyticsBlock rows={rows} title={title} mode="distribution" />
);

export const FinanceTrendChart = ({ rows = [], title }) => (
  <FinanceAnalyticsBlock rows={rows} title={title} mode="trend" />
);
