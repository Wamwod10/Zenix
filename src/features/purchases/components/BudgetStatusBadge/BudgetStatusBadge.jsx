// PDF 58: Byudjet holati badge'i — mavjud PurchaseStatusBadge vizual
// retseptidan foydalanadi (yangi rang/uslub yo'q).

import {
  BUDGET_STATUS_LABELS,
  BUDGET_STATUS_TONES,
} from "../../constants/budgets";

import "../PurchaseStatusBadge/PurchaseStatusBadge.scss";

const BudgetStatusBadge = ({ status }) => (
  <span
    className={`purchase-status-badge purchase-status-badge--${BUDGET_STATUS_TONES[status] || "neutral"}`}
  >
    {BUDGET_STATUS_LABELS[status] || status}
  </span>
);

export default BudgetStatusBadge;
