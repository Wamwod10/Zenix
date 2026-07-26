import { ArrowDownRight, ArrowUpRight, GitCompareArrows, Sparkles } from "lucide-react";

import { formatReportValue, formatSignedPercent } from "../../utils/reportsFormatters";
import "./ComparisonPanel.scss";

const modes = [
  ["today-yesterday", "Bugun vs kecha"],
  ["week-week", "Hafta"],
  ["month-month", "Oy"],
  ["year-year", "Yil"],
  ["branch-branch", "Filial"],
  ["product-product", "Mahsulot"],
  ["employee-employee", "Employee"],
  ["supplier-supplier", "Supplier"],
];

const ComparisonPanel = ({ comparison, mode, onMode }) => {
  const TrendIcon = comparison.trend === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <article className="comparison-panel">
      <div className="comparison-panel__head">
        <span className="reports-eyebrow">
          <GitCompareArrows size={14} />
          Comparison
        </span>
        <div role="tablist" aria-label="Comparison modes">
          {modes.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={mode === id} className={mode === id ? "is-active" : ""} onClick={() => onMode(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="comparison-panel__body">
        <strong>{comparison.title}</strong>
        <span className={`is-${comparison.trend}`}>
          <TrendIcon size={18} />
          {formatSignedPercent(comparison.percent)}
        </span>
        <p>Farq: {formatReportValue(Math.abs(comparison.diff), "UZS")}</p>
      </div>

      <p className="comparison-panel__ai">
        <Sparkles size={14} />
        {comparison.ai}
      </p>
    </article>
  );
};

export default ComparisonPanel;
