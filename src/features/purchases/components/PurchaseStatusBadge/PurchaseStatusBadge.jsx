import {
  PURCHASE_STATUS_LABELS,
  PURCHASE_STATUS_TONES,
} from "../../constants/purchaseStatuses";
import {
  INVOICE_STATUSES,
  INVOICE_STATUS_LABELS,
  RETURN_STATUSES,
  RETURN_STATUS_LABELS,
} from "../../constants/paymentTerms";

import "./PurchaseStatusBadge.scss";

const PurchaseStatusBadge = ({ status, label, tone }) => {
  const resolvedLabel = label || PURCHASE_STATUS_LABELS[status] || status;
  const resolvedTone = tone || PURCHASE_STATUS_TONES[status] || "neutral";

  return (
    <span
      className={`purchase-status-badge purchase-status-badge--${resolvedTone}`}
    >
      {resolvedLabel}
    </span>
  );
};

const INVOICE_TONES = {
  [INVOICE_STATUSES.pending]: "warning",
  [INVOICE_STATUSES.matched]: "info",
  [INVOICE_STATUSES.mismatch]: "danger",
  [INVOICE_STATUSES.partiallyPaid]: "warning",
  [INVOICE_STATUSES.paid]: "success",
};

export const InvoiceStatusBadge = ({ status }) => (
  <PurchaseStatusBadge
    status={status}
    label={INVOICE_STATUS_LABELS[status] || status}
    tone={INVOICE_TONES[status] || "neutral"}
  />
);

const RETURN_TONES = {
  [RETURN_STATUSES.pendingApproval]: "warning",
  [RETURN_STATUSES.approved]: "info",
  [RETURN_STATUSES.rejected]: "danger",
  [RETURN_STATUSES.completed]: "success",
};

export const ReturnStatusBadge = ({ status }) => (
  <PurchaseStatusBadge
    status={status}
    label={RETURN_STATUS_LABELS[status] || status}
    tone={RETURN_TONES[status] || "neutral"}
  />
);

export default PurchaseStatusBadge;
