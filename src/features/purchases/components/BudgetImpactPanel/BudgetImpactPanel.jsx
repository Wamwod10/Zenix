// PDF 57-60 (Enterprise) + Workflow bo'limi: PO wizard/detail sahifasida
// "Joriy byudjet / Qolgan byudjet / Xariddan keyingi byudjet" — foydalanuvchi
// tasdiqqa yuborishdan OLDIN ta'sirni ko'rishi kerak. Bir xil komponent
// wizard (real-time preview, `compact=false`) va PO Detail (post-factum,
// `compact=true`) da ishlatiladi.

import { Lock } from "lucide-react";

import BudgetStatusBadge from "../BudgetStatusBadge/BudgetStatusBadge";
import PurchaseAlert from "../PurchaseAlert/PurchaseAlert";
import PurchaseProgressBar from "../PurchaseProgressBar/PurchaseProgressBar";
import { BUDGET_SCOPE_LABELS } from "../../constants/budgets";
import { getBudgetPeriodLabel, getBudgetScopeLabel } from "../../utils/budgetCalculations";
import { formatCurrencyMoney } from "../../utils/purchaseMoney";

import "./BudgetImpactPanel.scss";

const toneForStatus = (status) => {
  if (status === "within_budget") return "success";
  if (status === "near_limit") return "info";
  if (status === "warning") return "warning";

  return "danger";
};

const BudgetImpactPanel = ({ impacts = [], getSupplier, compact = false }) => {
  if (!impacts.length) {
    return compact ? null : (
      <p className="budget-impact-panel__empty">
        Bu buyurtmaga tegishli faol byudjet topilmadi.
      </p>
    );
  }

  return (
    <div
      className={[
        "budget-impact-panel",
        compact ? "budget-impact-panel--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {impacts.map(({ budget, impact }) => (
        <div className="budget-impact-panel__row" key={budget.id}>
          <div className="budget-impact-panel__row-head">
            <div>
              <strong>{budget.name}</strong>
              <small>
                {BUDGET_SCOPE_LABELS[budget.scopeType]}
                {budget.scopeType !== "overall"
                  ? ` · ${getBudgetScopeLabel(budget, { getSupplier })}`
                  : ""}{" "}
                · {getBudgetPeriodLabel(budget)}
                {budget.hardLimit && (
                  <span className="budget-impact-panel__hard">
                    <Lock size={11} />
                    Qattiq chegara
                  </span>
                )}
              </small>
            </div>
            <BudgetStatusBadge status={impact.statusAfter} />
          </div>

          <div className="budget-impact-panel__figures">
            <div>
              <span>Joriy byudjet</span>
              <strong>{formatCurrencyMoney(impact.allocated, budget.currency)}</strong>
            </div>
            <div>
              <span>Qolgan (hozir)</span>
              <strong>{formatCurrencyMoney(impact.remaining, budget.currency)}</strong>
            </div>
            <div>
              <span>Xariddan keyin</span>
              <strong
                className={impact.afterRemaining < 0 ? "budget-impact-panel__negative" : ""}
              >
                {formatCurrencyMoney(impact.afterRemaining, budget.currency)}
              </strong>
            </div>
          </div>

          <PurchaseProgressBar
            value={Math.min(impact.afterUtilizationPercent, 100)}
            max={100}
            tone={toneForStatus(impact.statusAfter)}
            label={`${Math.round(impact.afterUtilizationPercent)}%`}
          />

          {impact.willBlock && (
            <PurchaseAlert tone="danger" title="Qattiq byudjet chegarasi oshib ketadi">
              Bu xarid "{budget.name}" byudjetini {Math.round(impact.afterUtilizationPercent)}%
              gacha oshiradi — qattiq chegara (Hard Limit) tufayli tasdiqqa yuborish bloklanadi.
              Davom etish uchun byudjetni oshiring yoki moliya bilan kelishing.
            </PurchaseAlert>
          )}

          {!impact.willBlock && impact.afterUtilizationPercent >= 100 && (
            <PurchaseAlert tone="warning" title="Byudjet chegarasidan oshadi">
              Bu xarid "{budget.name}" byudjetini {Math.round(impact.afterUtilizationPercent)}%
              gacha oshiradi. Yumshoq chegara (Soft Limit) — davom etish uchun sabab kiritish
              kerak bo'ladi.
            </PurchaseAlert>
          )}
        </div>
      ))}
    </div>
  );
};

export default BudgetImpactPanel;
