// PDF 41-46: Invoyslar jadvali — matching holati, to'lov, qoldiq, aging.

import { useState } from "react";
import { ChevronDown, Scale, Wallet } from "lucide-react";

import { InvoiceStatusBadge } from "../../components/PurchaseStatusBadge/PurchaseStatusBadge";
import PurchaseThreeWayMatchPanel from "../../components/PurchaseThreeWayMatchPanel/PurchaseThreeWayMatchPanel";
import { INVOICE_MATCH_TOLERANCE, INVOICE_STATUSES } from "../../constants/paymentTerms";
import {
  AGING_LABELS,
  getAgingBucket,
  getEffectiveReceivedQty,
  getInvoiceRemaining,
  toBaseQuantity,
} from "../../utils/purchaseCalculations";
import { formatMoney, formatPurchaseDate, formatQuantity } from "../../utils/purchaseMoney";

import "../purchaseTable.scss";
import "./PurchaseInvoicesTable.scss";

// LEGACY FALLBACK: invoys.matching.lines endi qator-darajasida hisoblanadi
// (threeWayMatching.js, PurchaseThreeWayMatchPanel orqali ko'rsatiladi) —
// bu funksiyalar faqat ESKI (shu o'zgarishdan OLDIN, localStorage'da)
// yaratilgan, qator ma'lumoti yo'q invoyslar uchun taxminiy zaxira sifatida
// saqlanadi.
const matchTone = (ratio) => {
  const abs = Math.abs(ratio);

  if (abs <= INVOICE_MATCH_TOLERANCE) return "good";
  if (abs <= INVOICE_MATCH_TOLERANCE * 5) return "warn";

  return "bad";
};

const buildMatchBreakdown = (invoice, order) => {
  if (!order) return null;

  const orderedQty = order.items.reduce(
    (sum, item) => sum + toBaseQuantity(item),
    0,
  );
  const receivedQty = order.items.reduce(
    (sum, item) => sum + Math.min(getEffectiveReceivedQty(item), toBaseQuantity(item)),
    0,
  );
  const poTotal = invoice.matching?.poTotal || 0;
  // Invoys summasi qabul nisbatidan kelib chiqqan — shu nisbatdan "invoys
  // miqdori"ni orqaga hisoblaymiz (invoysda alohida qator miqdori saqlanmaydi).
  const invoiceQty = poTotal > 0 ? Math.round(orderedQty * (invoice.amount / poTotal)) : receivedQty;

  const receivedValue = invoice.matching?.receivedValue || 0;
  const receivedUnitPrice = receivedQty > 0 ? receivedValue / receivedQty : 0;
  const invoiceUnitPrice = invoiceQty > 0 ? invoice.amount / invoiceQty : 0;
  const priceDiff = invoiceUnitPrice - receivedUnitPrice;
  const amountDiff = invoice.matching?.delta ?? invoice.amount - receivedValue;

  const priceRatio = receivedUnitPrice > 0 ? priceDiff / receivedUnitPrice : 0;
  const amountRatio = receivedValue > 0 ? amountDiff / receivedValue : 0;

  return {
    orderedQty,
    receivedQty,
    invoiceQty,
    priceDiff,
    amountDiff,
    priceTone: matchTone(priceRatio),
    amountTone: matchTone(amountRatio),
  };
};

const PurchaseInvoicesTable = ({
  invoices = [],
  getSupplier,
  getOrderById,
  canPay = false,
  onPay,
}) => {
  const [expandedId, setExpandedId] = useState(null);

  if (!invoices.length) {
    return (
      <div className="purchase-table">
        <p className="purchase-table__empty">Invoyslar hali yo'q.</p>
      </div>
    );
  }

  return (
    <div className="purchase-table purchase-invoices-table">
      <div
        className="purchase-table__row purchase-table__row--head purchase-invoices-table__row"
        role="row"
      >
        <span>Invoys / PO</span>
        <span>Yetkazib beruvchi</span>
        <span>Summa</span>
        <span>Qoldiq</span>
        <span>Muddat</span>
        <span>Holat</span>
        <span aria-hidden="true" />
      </div>

      {invoices.map((invoice) => {
        const remaining = getInvoiceRemaining(invoice);
        const aging = getAgingBucket(invoice.dueDate);
        const isPaid = invoice.status === INVOICE_STATUSES.paid;
        // PDF 42: katta farq — to'lov bloklanadi
        const paymentBlocked = invoice.status === INVOICE_STATUSES.mismatch;
        const expanded = expandedId === invoice.id;
        const order = getOrderById?.(invoice.orderId);
        const hasLineMatch = !!invoice.matching?.lines?.length;
        const breakdown =
          expanded && !hasLineMatch ? buildMatchBreakdown(invoice, order) : null;

        return (
          <div className="purchase-invoices-table__group" key={invoice.id}>
          <div
            className="purchase-table__row purchase-table__row--clickable purchase-invoices-table__row"
            role="row"
            onClick={() => setExpandedId(expanded ? null : invoice.id)}
          >
            <span className="purchase-table__primary">
              <strong>{invoice.number}</strong>
              <small>
                {invoice.orderNumber}
                {!invoice.matching?.matched && (
                  <span className="purchase-invoices-table__mismatch">
                    {" "}
                    · <Scale size={11} /> farq{" "}
                    {formatMoney(invoice.matching?.delta || 0)}
                  </span>
                )}
              </small>
            </span>

            <span>{getSupplier?.(invoice.supplierId)?.name || "—"}</span>

            <span className="purchase-table__money">
              {formatMoney(invoice.amount)}
            </span>

            <span className="purchase-table__money">
              {isPaid ? "—" : formatMoney(remaining)}
            </span>

            <span className="purchase-table__primary">
              <strong>{formatPurchaseDate(invoice.dueDate)}</strong>
              {!isPaid && (
                <small
                  className={
                    aging !== "current"
                      ? "purchase-invoices-table__overdue"
                      : ""
                  }
                >
                  {AGING_LABELS[aging]}
                </small>
              )}
            </span>

            <span>
              <InvoiceStatusBadge status={invoice.status} />
            </span>

            <span
              className="purchase-table__actions"
              onClick={(event) => event.stopPropagation()}
            >
              {canPay && !isPaid && (
                <button
                  type="button"
                  title={
                    paymentBlocked
                      ? "Matching farqi — to'lov nazoratda (baribir qayd etish mumkin)"
                      : "To'lov qayd etish"
                  }
                  onClick={() => onPay?.(invoice)}
                >
                  <Wallet size={15} />
                </button>
              )}

              <button
                type="button"
                title={expanded ? "Yopish" : "Uch tomonlama solishtirish"}
                className={
                  expanded
                    ? "purchase-invoices-table__chevron--open"
                    : ""
                }
                onClick={() => setExpandedId(expanded ? null : invoice.id)}
              >
                <ChevronDown size={15} />
              </button>
            </span>
          </div>

          {expanded && (
            <div className="purchase-invoices-table__detail">
              <strong className="purchase-invoices-table__detail-title">
                <Scale size={13} />
                Uch tomonlama solishtirish (Three-Way Matching)
              </strong>

              {hasLineMatch ? (
                <PurchaseThreeWayMatchPanel
                  lines={invoice.matching.lines}
                  summary={invoice.matching.summary}
                  compact
                />
              ) : !breakdown ? (
                <p className="purchase-invoices-table__detail-empty">
                  Bog'liq buyurtma topilmadi.
                </p>
              ) : (
                <div className="purchase-invoices-table__match-grid">
                  <div>
                    <span>Buyurtma miqdori</span>
                    <strong>{formatQuantity(breakdown.orderedQty)} dona</strong>
                  </div>
                  <div>
                    <span>Qabul miqdori</span>
                    <strong>{formatQuantity(breakdown.receivedQty)} dona</strong>
                  </div>
                  <div>
                    <span>Invoys miqdori</span>
                    <strong>{formatQuantity(breakdown.invoiceQty)} dona</strong>
                  </div>
                  <div
                    className={`purchase-invoices-table__match-cell--${breakdown.priceTone}`}
                  >
                    <span>Narx farqi (birlik uchun)</span>
                    <strong>{formatMoney(breakdown.priceDiff)}</strong>
                  </div>
                  <div
                    className={`purchase-invoices-table__match-cell--${breakdown.amountTone}`}
                  >
                    <span>Summa farqi</span>
                    <strong>{formatMoney(breakdown.amountDiff)}</strong>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        );
      })}
    </div>
  );
};

export default PurchaseInvoicesTable;
