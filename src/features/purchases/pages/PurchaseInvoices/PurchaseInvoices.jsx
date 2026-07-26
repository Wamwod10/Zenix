// PDF 41-53: Invoyslar, to'lovlar, qarzdorlik (outstanding + aging) va
// supplier qarz balansi.

import { useMemo, useState } from "react";
import { Plus, Receipt, Scale, Wallet } from "lucide-react";

import PageHeader from "../../../../components/layout/PageHeader/PageHeader";
import PurchaseKpiCard from "../../components/PurchaseKpiCard/PurchaseKpiCard";
import PurchaseProgressBar from "../../components/PurchaseProgressBar/PurchaseProgressBar";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import PurchaseInvoiceModal from "../../modals/PurchaseInvoiceModal/PurchaseInvoiceModal";
import PurchasePaymentModal from "../../modals/PurchasePaymentModal/PurchasePaymentModal";
import PurchaseInvoicesTable from "../../tables/PurchaseInvoicesTable/PurchaseInvoicesTable";
import { INVOICE_STATUS_LABELS, INVOICE_STATUSES } from "../../constants/paymentTerms";
import { hasPurchasePermission } from "../../constants/purchasePermissions";
import { INVOICEABLE_STATUSES } from "../../constants/purchaseStatuses";
import usePurchasesStore from "../../hooks/usePurchasesStore";
import {
  AGING_LABELS,
  getAgingBucket,
  getInvoiceRemainingInBaseCurrency,
} from "../../utils/purchaseCalculations";
import { formatCompactMoney, formatMoney } from "../../utils/purchaseMoney";

import "../../tables/purchaseTable.scss";
import "./PurchaseInvoices.scss";

const INVOICE_FILTER_STATUSES = [
  INVOICE_STATUSES.matched,
  INVOICE_STATUSES.mismatch,
  INVOICE_STATUSES.partiallyPaid,
  INVOICE_STATUSES.paid,
];

const AGING_TONES = {
  current: "info",
  d30: "warning",
  d60: "warning",
  d60plus: "danger",
};

const PurchaseInvoices = () => {
  const { invoices, orders, getSupplier, getOrderById, currentUser, actions, suppliers } =
    usePurchasesStore();

  const [payingInvoice, setPayingInvoice] = useState(null);
  const [invoiceOrderId, setInvoiceOrderId] = useState("");
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const canPay = hasPurchasePermission(currentUser.role, "payment.create");
  const canCreateInvoice = hasPurchasePermission(currentUser.role, "invoice.create");
  const invoiceableOrders = orders.filter((order) =>
    INVOICEABLE_STATUSES.includes(order.status),
  );
  const selectedInvoiceOrder =
    invoiceableOrders.find((order) => order.id === invoiceOrderId) || null;

  const visibleInvoices =
    statusFilter === "all"
      ? invoices
      : invoices.filter((invoice) => invoice.status === statusFilter);

  // PDF 45: Outstanding + aging
  const stats = useMemo(() => {
    const unpaid = invoices.filter(
      (invoice) => invoice.status !== INVOICE_STATUSES.paid,
    );

    // Turli invoyslar turli PO valyutasidan meros olgan bo'lishi mumkin —
    // to'g'ridan-to'g'ri qo'shib bo'lmaydi, shuning uchun BAZAVIY (UZS)
    // valyutadagi qoldiq ishlatiladi (getInvoiceRemainingInBaseCurrency).
    const outstanding = unpaid.reduce(
      (sum, invoice) => sum + getInvoiceRemainingInBaseCurrency(invoice),
      0,
    );

    const overdue = unpaid
      .filter((invoice) => getAgingBucket(invoice.dueDate) !== "current")
      .reduce((sum, invoice) => sum + getInvoiceRemainingInBaseCurrency(invoice), 0);

    const mismatchCount = invoices.filter(
      (invoice) => invoice.status === INVOICE_STATUSES.mismatch,
    ).length;

    const agingBuckets = unpaid.reduce(
      (map, invoice) => {
        const bucket = getAgingBucket(invoice.dueDate);

        map[bucket] += getInvoiceRemainingInBaseCurrency(invoice);

        return map;
      },
      { current: 0, d30: 0, d60: 0, d60plus: 0 },
    );

    return { outstanding, overdue, mismatchCount, agingBuckets };
  }, [invoices]);

  // PDF 53: Supplier qarz balansi (BAZAVIY valyutada — izoh yuqorida)
  const supplierDebts = useMemo(() => {
    const debtMap = invoices.reduce((map, invoice) => {
      const remaining = getInvoiceRemainingInBaseCurrency(invoice);

      if (remaining > 0) {
        map[invoice.supplierId] = (map[invoice.supplierId] || 0) + remaining;
      }

      return map;
    }, {});

    return suppliers
      .map((supplier) => ({
        supplier,
        debt: debtMap[supplier.id] || 0,
      }))
      .filter((entry) => entry.debt > 0)
      .sort((a, b) => b.debt - a.debt);
  }, [invoices, suppliers]);

  return (
    <div className="purchase-invoices-page">
      <PageHeader
        eyebrow="Xaridlar"
        title="Invoyslar va to'lovlar"
        description="Yetkazib beruvchi hisob-fakturalari, three-way matching, to'lovlar va qarzdorlik nazorati."
      />

      <section className="purchase-invoices-page__kpi">
        <PurchaseKpiCard
          icon={Wallet}
          label="Jami qarzdorlik"
          value={formatMoney(stats.outstanding)}
          tone="danger"
        />
        <PurchaseKpiCard
          icon={Wallet}
          label="Muddati o'tgan"
          value={formatMoney(stats.overdue)}
          tone="warning"
        />
        <PurchaseKpiCard
          icon={Scale}
          label="Matching farqi"
          value={`${stats.mismatchCount} ta invoys`}
          hint="To'lovdan oldin tekshirilsin"
        />
        <PurchaseKpiCard
          icon={Receipt}
          label="Jami invoyslar"
          value={`${invoices.length} ta`}
          tone="success"
        />
      </section>

      <section className="purchase-invoices-page__aging">
        {Object.entries(stats.agingBuckets).map(([bucket, amount]) => (
          <div
            className={`purchase-invoices-page__aging-cell purchase-invoices-page__aging-cell--${bucket}`}
            key={bucket}
          >
            <span>{AGING_LABELS[bucket]}</span>
            <strong>{formatCompactMoney(amount)}</strong>
            <PurchaseProgressBar
              value={amount}
              max={Math.max(stats.outstanding, 1)}
              tone={AGING_TONES[bucket] || "neutral"}
            />
          </div>
        ))}
      </section>

      <div className="purchase-invoices-page__filters">
        {canCreateInvoice && (
          <div className="purchase-invoices-page__create">
            <PurchaseSelectField
              value={invoiceOrderId}
              placeholder="PO tanlang"
              options={[
                { value: "", label: "PO tanlang" },
                ...invoiceableOrders.map((order) => ({
                  value: order.id,
                  label: `${order.number} · ${getSupplier(order.supplierId)?.name || "Yetkazib beruvchi"}`,
                })),
              ]}
              onChange={setInvoiceOrderId}
            />

            <button
              className="purchase-btn purchase-btn--primary"
              type="button"
              disabled={!selectedInvoiceOrder}
              onClick={() => setInvoiceModalOpen(true)}
            >
              <Plus size={15} />
              Invoys kiritish
            </button>
          </div>
        )}

        <PurchaseSelectField
          value={statusFilter}
          placeholder="Barcha holatlar"
          options={[
            { value: "all", label: "Barcha holatlar" },
            ...INVOICE_FILTER_STATUSES.map((status) => ({
              value: status,
              label: INVOICE_STATUS_LABELS[status],
            })),
          ]}
          onChange={setStatusFilter}
        />
      </div>

      <PurchaseInvoicesTable
        invoices={visibleInvoices}
        getSupplier={getSupplier}
        getOrderById={getOrderById}
        canPay={canPay}
        onPay={setPayingInvoice}
      />

      <PurchaseInvoiceModal
        open={invoiceModalOpen}
        order={selectedInvoiceOrder}
        existingInvoices={invoices}
        getSupplier={getSupplier}
        onClose={() => setInvoiceModalOpen(false)}
        onConfirm={(payload) => {
          actions.createInvoice(payload, currentUser);
          setInvoiceModalOpen(false);
        }}
      />

      {supplierDebts.length > 0 && (
        <section className="purchase-invoices-page__debts">
          <h3>Yetkazib beruvchi qarz balansi</h3>

          <div className="purchase-table purchase-invoices-page__debt-list">
            {supplierDebts.map((entry) => (
              <div className="purchase-table__row" key={entry.supplier.id}>
                <span className="purchase-table__primary">
                  <strong>{entry.supplier.name}</strong>
                  <small>
                    Kredit limit: {formatCompactMoney(entry.supplier.creditLimit)}
                  </small>
                </span>
                <span className="purchase-table__money">
                  {formatMoney(entry.debt)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <PurchasePaymentModal
        open={!!payingInvoice}
        invoice={payingInvoice}
        onClose={() => setPayingInvoice(null)}
        onConfirm={(payload) => {
          actions.addPayment(payload, currentUser);
          setPayingInvoice(null);
        }}
      />
    </div>
  );
};

export default PurchaseInvoices;
