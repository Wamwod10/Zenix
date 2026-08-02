// PDF 2: Purchase Orders Dashboard jadvali — ustunlar: PO raqami, supplier,
// sana, summa, holat, yetkazish sanasi, to'lov holati. Bulk + quick actions.

import { useEffect, useMemo, useRef } from "react";
import {
  Copy,
  Eye,
  PackageCheck,
  PackageSearch,
  Pencil,
  Printer,
} from "lucide-react";

import { EmptyState } from "../../../../components/ui/EmptyState/EmptyState";
import PurchaseStatusBadge from "../../components/PurchaseStatusBadge/PurchaseStatusBadge";
import {
  PURCHASE_STATUSES,
  RECEIVABLE_STATUSES,
} from "../../constants/purchaseStatuses";
import { calculateOrderTotals } from "../../utils/purchaseCalculations";
import {
  formatCurrencyMoney,
  formatMoney,
  formatPurchaseDate,
} from "../../utils/purchaseMoney";

import "../purchaseTable.scss";
import "./PurchaseOrdersTable.scss";

const paymentStatusOf = (order, invoices) => {
  const related = invoices.filter((invoice) => invoice.orderId === order.id);

  if (!related.length) return { label: "To'lanmagan", tone: "neutral" };

  const paid = related.every((invoice) => invoice.status === "paid");

  if (paid) return { label: "To'langan", tone: "success" };

  const anyPayment = related.some((invoice) => invoice.paidAmount > 0);

  return anyPayment
    ? { label: "Qisman to'langan", tone: "warning" }
    : { label: "To'lanmagan", tone: "danger" };
};

const PurchaseOrdersTable = ({
  orders = [],
  invoices = [],
  getSupplier,
  compact = false,
  selectedIds = [],
  onToggleSelected,
  onToggleAll,
  page = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
  onView,
  onEditDraft,
  onDuplicate,
  onReceive,
  onPrint,
}) => {
  const selectAllRef = useRef(null);
  const allOnPageSelected = orders.length > 0 && orders.every((order) =>
    selectedIds.includes(order.id),
  );
  const someOnPageSelected = orders.some((order) =>
    selectedIds.includes(order.id),
  );
  const pageNumbers = useMemo(() => {
    const pages = new Set([1, page - 1, page, page + 1, totalPages]);

    return Array.from(pages)
      .filter((entry) => entry >= 1 && entry <= totalPages)
      .sort((a, b) => a - b);
  }, [page, totalPages]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someOnPageSelected && !allOnPageSelected;
    }
  }, [allOnPageSelected, someOnPageSelected]);

  const handleRowKeyDown = (event, order) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onView?.(order);
    }
  };

  if (!orders.length) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Buyurtmalar topilmadi"
        description="Filtrlarni o'zgartiring yoki yangi xarid buyurtmasi yarating."
      />
    );
  }

  return (
    <div
      className={[
        "purchase-table",
        "purchase-orders-table",
        compact ? "purchase-orders-table--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="purchase-table__row purchase-table__row--head purchase-orders-table__row"
        role="row"
      >
        <input
          ref={selectAllRef}
          className="purchase-table__checkbox"
          type="checkbox"
          aria-label="Sahifadagi barchasini tanlash"
          aria-checked={someOnPageSelected && !allOnPageSelected ? "mixed" : allOnPageSelected}
          checked={allOnPageSelected}
          onChange={onToggleAll}
        />
        <span>PO / Yetkazib beruvchi</span>
        <span>Sana</span>
        <span>Summa</span>
        <span>Holat</span>
        <span>Yetkazish</span>
        <span>To'lov</span>
        <span aria-hidden="true" />
      </div>

      {orders.map((order) => {
        const supplier = getSupplier?.(order.supplierId);
        const totals = calculateOrderTotals(order);
        const payment = paymentStatusOf(order, invoices);
        const selected = selectedIds.includes(order.id);
        const isDraft = order.status === PURCHASE_STATUSES.draft;
        const receivable = RECEIVABLE_STATUSES.includes(order.status);

        return (
          <div
            className={[
              "purchase-table__row",
              "purchase-table__row--clickable",
              "purchase-orders-table__row",
              selected ? "purchase-table__row--selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            role="button"
            tabIndex={0}
            key={order.id}
            onClick={() => onView?.(order)}
            onKeyDown={(event) => handleRowKeyDown(event, order)}
          >
            <input
              className="purchase-table__checkbox"
              type="checkbox"
              aria-label={`${order.number} ni tanlash`}
              checked={selected}
              onClick={(event) => event.stopPropagation()}
              onChange={() => onToggleSelected?.(order.id)}
            />

            <span className="purchase-table__primary">
              <strong>{order.number}</strong>
              <small>{supplier?.name || "Noma'lum yetkazib beruvchi"}</small>
            </span>

            <span>{formatPurchaseDate(order.createdAt)}</span>

            <span className="purchase-table__money">
              {formatCurrencyMoney(totals.total, order.currency)}
              {order.currency && order.currency !== "UZS" && (
                <small className="purchase-orders-table__base-total">
                  {/* Point 12: valyuta formati BUTUN modulda bir xil —
                      "44 USD ≈ 556 600 so'm" */}
                  ≈ {formatMoney(Math.round(totals.total * (order.exchangeRate || 1)))}
                </small>
              )}
            </span>

            <span>
              <PurchaseStatusBadge status={order.status} />
            </span>

            <span>{formatPurchaseDate(order.expectedDate)}</span>

            <span>
              <PurchaseStatusBadge
                status={payment.label}
                label={payment.label}
                tone={payment.tone}
              />
            </span>

            <span
              className="purchase-table__actions"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                title="Ko'rish"
                aria-label={`${order.number} buyurtmasini ko'rish`}
                onClick={() => onView?.(order)}
              >
                <Eye size={15} />
              </button>

              <button
                type="button"
                title="Tahrirlash (faqat draft)"
                aria-label={`${order.number} qoralamasini tahrirlash`}
                disabled={!isDraft}
                onClick={() => onEditDraft?.(order)}
              >
                <Pencil size={15} />
              </button>

              <button
                type="button"
                title="Nusxalash"
                aria-label={`${order.number} buyurtmasidan nusxa olish`}
                onClick={() => onDuplicate?.(order)}
              >
                <Copy size={15} />
              </button>

              <button
                type="button"
                title="Yetkazish qabul"
                aria-label={`${order.number} bo'yicha yetkazishni qabul qilish`}
                disabled={!receivable}
                onClick={() => onReceive?.(order)}
              >
                <PackageCheck size={15} />
              </button>

              <button
                type="button"
                title="PDF / chop etish"
                aria-label={`${order.number} buyurtmasini PDF yoki chop etish`}
                onClick={() => onPrint?.(order)}
              >
                <Printer size={15} />
              </button>
            </span>
          </div>
        );
      })}

      <div className="purchase-table__pagination">
        <span>
          Jami {totalCount} ta · {page}/{totalPages}-sahifa
        </span>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
        >
          Oldingi
        </button>
        {pageNumbers.map((pageNumber) => (
          <button
            className={
              pageNumber === page
                ? "purchase-table__page-btn purchase-table__page-btn--active"
                : "purchase-table__page-btn"
            }
            type="button"
            key={pageNumber}
            aria-current={pageNumber === page ? "page" : undefined}
            onClick={() => onPageChange?.(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
        >
          Keyingi
        </button>
      </div>
    </div>
  );
};

export default PurchaseOrdersTable;
