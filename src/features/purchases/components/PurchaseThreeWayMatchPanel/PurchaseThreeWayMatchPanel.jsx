// Enterprise Three-Way Matching — PO / Qabul / Invoys qator-darajasidagi
// solishtiruv natijasini ko'rsatadi. Sof taqdimot komponenti: `lines` va
// `summary` tashqaridan tayyor holda keladi (threeWayMatching.js) — bir xil
// komponent ham live preview (PurchaseInvoiceModal, invoys hali
// saqlanmagan), ham saqlangan invoys (PurchaseOrderDetail, PurchaseInvoicesTable)
// uchun ishlatiladi.

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Scale,
  XCircle,
} from "lucide-react";

import PurchaseStatusBadge from "../PurchaseStatusBadge/PurchaseStatusBadge";
import {
  LINE_MATCH_STATUS_LABELS,
  LINE_MATCH_STATUS_TONES,
  LINE_MATCH_STATUSES,
} from "../../utils/threeWayMatching";
import { formatMoney, formatQuantity } from "../../utils/purchaseMoney";

import "./PurchaseThreeWayMatchPanel.scss";

const STATUS_ICONS = {
  [LINE_MATCH_STATUSES.matched]: CheckCircle2,
  [LINE_MATCH_STATUSES.partial]: Clock,
  [LINE_MATCH_STATUSES.mismatch]: XCircle,
  [LINE_MATCH_STATUSES.missing]: AlertCircle,
  [LINE_MATCH_STATUSES.extra]: PlusCircle,
};

const COUNT_LABELS = {
  matched: "mos",
  partial: "qisman",
  mismatch: "nomuvofiq",
  missing: "yetishmayapti",
  extra: "ortiqcha",
};

const PurchaseThreeWayMatchPanel = ({
  lines = [],
  summary,
  emptyText = "Solishtirish uchun qator yo'q.",
  compact = false,
}) => {
  if (!summary || !lines.length) {
    return (
      <div className="three-way-match three-way-match--empty">
        <Scale size={15} />
        <span>{emptyText}</span>
      </div>
    );
  }

  const countEntries = Object.entries(summary.counts).filter(
    ([, count]) => count > 0,
  );

  return (
    <div
      className={
        compact ? "three-way-match three-way-match--compact" : "three-way-match"
      }
    >
      <div className="three-way-match__summary">
        <PurchaseStatusBadge
          status={summary.overallStatus}
          label={LINE_MATCH_STATUS_LABELS[summary.overallStatus]}
          tone={LINE_MATCH_STATUS_TONES[summary.overallStatus]}
        />

        <span className="three-way-match__counts">
          {countEntries
            .map(([status, count]) => `${count} ta ${COUNT_LABELS[status]}`)
            .join(" · ")}
        </span>

        {summary.delta !== 0 && (
          <span className="three-way-match__delta">
            <Scale size={12} />
            Farq: {formatMoney(summary.delta)}
          </span>
        )}
      </div>

      <div className="three-way-match__lines">
        {lines.map((line) => {
          const Icon = STATUS_ICONS[line.status] || CheckCircle2;

          return (
            <div
              className={`three-way-match__line three-way-match__line--${line.status}`}
              key={line.itemId || line.name}
            >
              <div className="three-way-match__line-head">
                <Icon size={14} />
                <strong>{line.name}</strong>
                {line.sku && <small>{line.sku}</small>}
                <PurchaseStatusBadge
                  status={line.status}
                  label={LINE_MATCH_STATUS_LABELS[line.status]}
                  tone={LINE_MATCH_STATUS_TONES[line.status]}
                />
              </div>

              <div className="three-way-match__line-qty">
                <span>
                  Buyurtma <strong>{formatQuantity(line.orderedQty)}</strong>
                </span>
                <span>
                  Qabul <strong>{formatQuantity(line.receivedQty)}</strong>
                </span>
                <span>
                  Invoys <strong>{formatQuantity(line.invoicedQty)}</strong>
                </span>
                <span>
                  Jami <strong>{formatMoney(line.lineTotal.invoiced)}</strong>
                </span>
              </div>

              {line.status !== LINE_MATCH_STATUSES.matched && (
                <ul className="three-way-match__reasons">
                  {line.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PurchaseThreeWayMatchPanel;
