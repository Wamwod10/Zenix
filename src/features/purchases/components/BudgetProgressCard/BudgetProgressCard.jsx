// PDF 57-60 (Enterprise): bitta byudjet uchun to'liq nazorat kartasi —
// Allocated/Consumed/Remaining/Available, Utilization%, Forecast, Status.

import {
  CalendarRange,
  Lock,
  PencilLine,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";

import BudgetStatusBadge from "../BudgetStatusBadge/BudgetStatusBadge";
import PurchaseProgressBar from "../PurchaseProgressBar/PurchaseProgressBar";
import {
  BUDGET_ENFORCEMENT,
  BUDGET_PERIOD_LABELS,
  BUDGET_SCOPE_LABELS,
} from "../../constants/budgets";
import {
  getBudgetPeriodLabel,
  getBudgetScopeLabel,
  getCrossedThresholds,
  resolveBudgetStatus,
} from "../../utils/budgetCalculations";
import { formatCompactMoney, formatCurrencyMoney } from "../../utils/purchaseMoney";

import "./BudgetProgressCard.scss";

const progressTone = (status) => {
  if (status === "within_budget") return "success";
  if (status === "near_limit") return "info";
  if (status === "warning") return "warning";

  return "danger";
};

const BudgetProgressCard = ({
  budget,
  consumption,
  getSupplier,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  const enforcement = budget.hardLimit ? BUDGET_ENFORCEMENT.hard : BUDGET_ENFORCEMENT.soft;
  const status = resolveBudgetStatus(consumption.utilizationPercent, enforcement);
  const utilizationDisplay = Math.min(Math.round(consumption.utilizationPercent), 999);
  const crossedThresholds = getCrossedThresholds(
    consumption.utilizationPercent,
    budget.thresholds,
  );

  return (
    <article
      className={[
        "budget-card",
        !budget.active ? "budget-card--inactive" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="budget-card__head">
        <div>
          <strong>{budget.name}</strong>
          <div className="budget-card__meta">
            <span>
              <Tag size={12} />
              {BUDGET_SCOPE_LABELS[budget.scopeType]}
              {budget.scopeType !== "overall"
                ? ` · ${getBudgetScopeLabel(budget, { getSupplier })}`
                : ""}
            </span>
            <span>
              <CalendarRange size={12} />
              {BUDGET_PERIOD_LABELS[budget.periodType]} · {getBudgetPeriodLabel(budget)}
            </span>
            {budget.hardLimit && (
              <span className="budget-card__hard">
                <Lock size={12} />
                Qattiq chegara
              </span>
            )}
          </div>
        </div>

        <BudgetStatusBadge status={status} />
      </header>

      <div className="budget-card__figures">
        <div>
          <span>Ajratilgan</span>
          <strong>{formatCurrencyMoney(consumption.allocated, budget.currency)}</strong>
        </div>
        <div>
          <span>Sarflangan</span>
          <strong>{formatCurrencyMoney(consumption.consumed, budget.currency)}</strong>
        </div>
        <div>
          <span>Qolgan</span>
          <strong className={consumption.remaining < 0 ? "budget-card__negative" : ""}>
            {formatCurrencyMoney(consumption.remaining, budget.currency)}
          </strong>
        </div>
        <div>
          <span>Mavjud (draftlarsiz)</span>
          <strong className={consumption.available < 0 ? "budget-card__negative" : ""}>
            {formatCurrencyMoney(consumption.available, budget.currency)}
          </strong>
        </div>
      </div>

      <PurchaseProgressBar
        value={Math.min(consumption.utilizationPercent, 100)}
        max={100}
        tone={progressTone(status)}
        label={`${utilizationDisplay}%`}
      />

      <div className="budget-card__footline">
        <span>
          <TrendingUp size={12} />
          Prognoz: {formatCompactMoney(consumption.forecastAmount)} (
          {Math.round(consumption.forecastPercent)}%) davr oxirigacha
        </span>
        <span>{consumption.matchingOrderCount} ta PO</span>
      </div>

      {crossedThresholds.length > 0 && (
        <div className="budget-card__thresholds">
          {crossedThresholds.map((value) => (
            <span key={value}>{value}% chegarasi o'tildi</span>
          ))}
        </div>
      )}

      <footer className="budget-card__actions">
        <label className="budget-card__toggle">
          <input
            type="checkbox"
            checked={budget.active}
            onChange={(event) => onToggleActive?.(budget.id, event.target.checked)}
          />
          <span>{budget.active ? "Faol" : "Nofaol"}</span>
        </label>

        <div className="budget-card__buttons">
          <button
            type="button"
            className="purchase-btn purchase-btn--ghost"
            onClick={() => onEdit?.(budget)}
          >
            <PencilLine size={14} />
            Tahrirlash
          </button>
          <button
            type="button"
            className="purchase-btn purchase-btn--ghost budget-card__delete"
            onClick={() => onDelete?.(budget)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </footer>
    </article>
  );
};

export default BudgetProgressCard;
