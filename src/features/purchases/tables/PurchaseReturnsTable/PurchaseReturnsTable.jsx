// PDF 36-38: Qaytarishlar ro'yxati — tasdiqlash amallari va
// ochiladigan tafsilot (tarkib, izoh, vaqt chizig'i).

import { useState } from "react";
import { CheckCircle2, ChevronDown, XCircle } from "lucide-react";

import { ReturnStatusBadge } from "../../components/PurchaseStatusBadge/PurchaseStatusBadge";
import {
  RETURN_REASONS,
  RETURN_STATUSES,
  getReturnCompensationLabel,
} from "../../constants/paymentTerms";
import {
  formatMoney,
  formatPurchaseDate,
  formatQuantity,
} from "../../utils/purchaseMoney";

import "../purchaseTable.scss";
import "./PurchaseReturnsTable.scss";

const reasonLabel = (id) =>
  RETURN_REASONS.find((reason) => reason.id === id)?.label || id;

const TIMELINE_TONES = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const PurchaseReturnsTable = ({
  returns = [],
  getSupplier,
  canApprove = false,
  onApprove,
  onReject,
}) => {
  const [expandedId, setExpandedId] = useState(null);

  if (!returns.length) {
    return (
      <div className="purchase-table">
        <p className="purchase-table__empty">Qaytarishlar hali yo'q.</p>
      </div>
    );
  }

  return (
    <div className="purchase-table purchase-returns-table">
      <div
        className="purchase-table__row purchase-table__row--head purchase-returns-table__row"
        role="row"
      >
        <span>Hujjat / PO</span>
        <span>Yetkazib beruvchi</span>
        <span>Sabab</span>
        <span>Summa</span>
        <span>Holat</span>
        <span>Sana</span>
        <span aria-hidden="true" />
      </div>

      {returns.map((entry) => {
        const expanded = expandedId === entry.id;

        return (
          <div className="purchase-returns-table__group" key={entry.id}>
            <div
              className="purchase-table__row purchase-table__row--clickable purchase-returns-table__row"
              role="row"
              onClick={() => setExpandedId(expanded ? null : entry.id)}
            >
              <span className="purchase-table__primary">
                <strong>{entry.number}</strong>
                <small>
                  {entry.orderNumber} · {entry.createdBy}
                </small>
              </span>

              <span>{getSupplier?.(entry.supplierId)?.name || "—"}</span>

              <span>{reasonLabel(entry.reason)}</span>

              <span className="purchase-table__money">
                {formatMoney(entry.total)}
              </span>

              <span>
                <ReturnStatusBadge status={entry.status} />
                {entry.status === RETURN_STATUSES.rejected &&
                  entry.rejectReason && (
                    <small className="purchase-returns-table__reject-reason">
                      {entry.rejectReason}
                    </small>
                  )}
              </span>

              <span>{formatPurchaseDate(entry.createdAt)}</span>

              <span
                className="purchase-table__actions"
                onClick={(event) => event.stopPropagation()}
              >
                {canApprove &&
                  entry.status === RETURN_STATUSES.pendingApproval && (
                    <>
                      <button
                        type="button"
                        title="Qaytarishni tasdiqlash"
                        onClick={() => onApprove?.(entry)}
                      >
                        <CheckCircle2 size={15} />
                      </button>
                      <button
                        type="button"
                        title="Rad etish"
                        onClick={() => onReject?.(entry)}
                      >
                        <XCircle size={15} />
                      </button>
                    </>
                  )}

                <button
                  type="button"
                  title={expanded ? "Yopish" : "Tafsilot"}
                  className={
                    expanded ? "purchase-returns-table__chevron--open" : ""
                  }
                  onClick={() => setExpandedId(expanded ? null : entry.id)}
                >
                  <ChevronDown size={15} />
                </button>
              </span>
            </div>

            {expanded && (
              <div className="purchase-returns-table__detail">
                <div className="purchase-returns-table__items">
                  <strong>Qaytarilayotgan tovarlar</strong>

                  {entry.items.map((item) => (
                    <div
                      className="purchase-returns-table__item"
                      key={item.itemId}
                    >
                      <span>{item.name}</span>
                      <span>{formatQuantity(item.quantity)} dona</span>
                      <span>{formatMoney(item.quantity * item.price)}</span>
                    </div>
                  ))}

                  <p className="purchase-returns-table__note">
                    Kompensatsiya: {getReturnCompensationLabel(entry.compensation)}
                  </p>

                  {entry.note && (
                    <p className="purchase-returns-table__note">
                      Izoh: {entry.note}
                    </p>
                  )}
                </div>

                <div className="purchase-returns-table__timeline">
                  <strong>Jarayon</strong>

                  {(entry.timeline || []).length === 0 && (
                    <p className="purchase-returns-table__note">
                      Hodisalar qayd etilmagan.
                    </p>
                  )}

                  {(entry.timeline || []).map((event) => (
                    <div
                      className={`purchase-returns-table__event purchase-returns-table__event--${
                        TIMELINE_TONES[event.type] || "warning"
                      }`}
                      key={event.id}
                    >
                      <span>{event.label}</span>
                      <small>
                        {event.actor} ·{" "}
                        {formatPurchaseDate(event.at, { withTime: true })}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PurchaseReturnsTable;
