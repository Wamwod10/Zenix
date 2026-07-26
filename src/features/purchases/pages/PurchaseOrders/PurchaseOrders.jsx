// PDF 2: Purchase Orders Dashboard — xaridorning asosiy ish maydoni.
// Filtr, qidiruv, sort, bulk eksport, quick actions.

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Download,
  LayoutList,
  Plus,
  Rows3,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import PageHeader from "../../../../components/layout/PageHeader/PageHeader";
import PurchaseDateField from "../../components/PurchaseDateField/PurchaseDateField";
import PurchaseSelectField from "../../components/PurchaseSelectField/PurchaseSelectField";
import ReceiveGoodsModal from "../../modals/ReceiveGoodsModal/ReceiveGoodsModal";
import PurchaseOrdersTable from "../../tables/PurchaseOrdersTable/PurchaseOrdersTable";
import {
  PURCHASE_STATUSES,
  PURCHASE_STATUS_LABELS,
} from "../../constants/purchaseStatuses";
import { PURCHASE_CURRENCIES } from "../../constants/currencies";
import usePurchaseOrderFilters, {
  SORT_OPTIONS,
} from "../../hooks/usePurchaseOrderFilters";
import usePurchasesStore from "../../hooks/usePurchasesStore";
import {
  exportOrdersToCsv,
  printPurchaseOrder,
} from "../../utils/purchasePrint";

import "./PurchaseOrders.scss";

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const {
    orders,
    invoices,
    suppliers,
    warehouses,
    getSupplier,
    currentUser,
    actions,
  } = usePurchasesStore();

  const {
    filters,
    setFilter,
    resetFilters,
    filteredOrders,
    pagedOrders,
    page,
    setPage,
    totalPages,
    selectedIds,
    toggleSelected,
    toggleAllOnPage,
    clearSelection,
  } = usePurchaseOrderFilters(orders, getSupplier);

  const [receivingOrder, setReceivingOrder] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Point 23: katta PO ro'yxati uchun ixcham (compact) ko'rinish
  const [compact, setCompact] = useState(false);

  const advancedFilterCount = useMemo(
    () =>
      [
        filters.supplierId !== "all",
        filters.currency !== "all",
        filters.warehouseId !== "all",
        Boolean(filters.dateFrom),
        Boolean(filters.dateTo),
      ].filter(Boolean).length,
    [filters],
  );

  const handleDuplicate = (order) => {
    // PDF 2/4 future: nusxalash — yangi draft yaratiladi
    const copy = actions.createOrder(
      {
        supplierId: order.supplierId,
        warehouseId: order.warehouseId,
        branch: order.branch,
        expectedDate: order.expectedDate,
        paymentTerm: order.paymentTerm,
        taxMode: order.taxMode,
        orderDiscountPercent: order.orderDiscountPercent,
        items: order.items.map((item) => ({
          ...item,
          receivedQty: 0,
          returnedQty: 0,
          damagedQty: 0,
          missingQty: 0,
        })),
        notes: [],
        attachments: [],
      },
      { submit: false },
    );

    if (copy) navigate(`/purchases/orders/${copy.id}`);
  };

  const handleExport = () => {
    const source = selectedIds.length
      ? filteredOrders.filter((order) => selectedIds.includes(order.id))
      : filteredOrders;

    exportOrdersToCsv(source, getSupplier);
    clearSelection();
  };

  return (
    <div className="purchase-orders-page">
      <PageHeader
        eyebrow="Xaridlar"
        title="Xarid buyurtmalari"
        description="Barcha PO larni qidiring, filtrlang va boshqaring."
        actions={
          <button
            className="purchase-btn purchase-btn--primary"
            type="button"
            onClick={() => navigate("/purchases/orders/new")}
          >
            <Plus size={16} />
            Yangi buyurtma
          </button>
        }
      />

      <section className="purchase-orders-page__filters">
        <div className="purchase-orders-page__filters-row">
          <label className="purchase-orders-page__search">
            <Search size={15} />
            <input
              type="text"
              placeholder="PO raqami, yetkazib beruvchi yoki tovar..."
              value={filters.search}
              onChange={(event) => setFilter("search", event.target.value)}
            />
          </label>

          <PurchaseSelectField
            className="purchase-orders-page__status-select"
            value={filters.status}
            placeholder="Barcha holatlar"
            options={[
              { value: "all", label: "Barcha holatlar" },
              ...Object.values(PURCHASE_STATUSES).map((status) => ({
                value: status,
                label: PURCHASE_STATUS_LABELS[status],
              })),
            ]}
            onChange={(value) => setFilter("status", value)}
          />

          <button
            className={
              showAdvanced || advancedFilterCount
                ? "purchase-btn purchase-btn--ghost purchase-orders-page__advanced-toggle purchase-orders-page__advanced-toggle--active"
                : "purchase-btn purchase-btn--ghost purchase-orders-page__advanced-toggle"
            }
            type="button"
            onClick={() => setShowAdvanced((current) => !current)}
          >
            <SlidersHorizontal size={15} />
            Qo'shimcha filtrlar
            {advancedFilterCount > 0 && (
              <span className="purchase-orders-page__advanced-count">
                {advancedFilterCount}
              </span>
            )}
            <ChevronDown
              size={14}
              className={
                showAdvanced
                  ? "purchase-orders-page__chevron purchase-orders-page__chevron--open"
                  : "purchase-orders-page__chevron"
              }
            />
          </button>

          <button
            className="purchase-btn purchase-btn--ghost"
            type="button"
            title="Filtrlarni tozalash"
            onClick={resetFilters}
          >
            <RotateCcw size={15} />
          </button>

          <button
            className="purchase-btn purchase-btn--ghost"
            type="button"
            onClick={handleExport}
          >
            <Download size={15} />
            {selectedIds.length ? `Eksport (${selectedIds.length})` : "Eksport"}
          </button>

          <button
            className="purchase-btn purchase-btn--ghost"
            type="button"
            title={compact ? "Odatiy ko'rinish" : "Ixcham ko'rinish"}
            aria-pressed={compact}
            onClick={() => setCompact((current) => !current)}
          >
            {compact ? <LayoutList size={15} /> : <Rows3 size={15} />}
            {compact ? "Odatiy" : "Ixcham"}
          </button>
        </div>

        {showAdvanced && (
          <div className="purchase-orders-page__advanced-row">
            <PurchaseSelectField
              label="Yetkazib beruvchi"
              value={filters.supplierId}
              placeholder="Barcha yetkazib beruvchilar"
              options={[
                { value: "all", label: "Barcha yetkazib beruvchilar" },
                ...suppliers.map((supplier) => ({
                  value: supplier.id,
                  label: supplier.name,
                })),
              ]}
              onChange={(value) => setFilter("supplierId", value)}
            />

            <PurchaseSelectField
              label="Valyuta"
              value={filters.currency}
              placeholder="Barcha valyutalar"
              options={[
                { value: "all", label: "Barcha valyutalar" },
                ...PURCHASE_CURRENCIES.map((currency) => ({
                  value: currency.code,
                  label: currency.label,
                })),
              ]}
              onChange={(value) => setFilter("currency", value)}
            />

            <PurchaseSelectField
              label="Ombor"
              value={filters.warehouseId}
              placeholder="Barcha omborlar"
              options={[
                { value: "all", label: "Barcha omborlar" },
                ...warehouses.map((warehouse) => ({
                  value: warehouse.id,
                  label: warehouse.name,
                })),
              ]}
              onChange={(value) => setFilter("warehouseId", value)}
            />

            <div className="purchase-orders-page__date-range">
              <PurchaseDateField
                label="Sanadan"
                value={filters.dateFrom}
                onChange={(event) => setFilter("dateFrom", event.target.value)}
              />
              <span className="purchase-orders-page__date-sep">—</span>
              <PurchaseDateField
                label="Sanagacha"
                value={filters.dateTo}
                onChange={(event) => setFilter("dateTo", event.target.value)}
              />
            </div>

            <PurchaseSelectField
              label="Saralash"
              value={filters.sortBy}
              options={SORT_OPTIONS}
              onChange={(value) => setFilter("sortBy", value)}
            />
          </div>
        )}
      </section>

      <PurchaseOrdersTable
        orders={pagedOrders}
        invoices={invoices}
        getSupplier={getSupplier}
        compact={compact}
        selectedIds={selectedIds}
        onToggleSelected={toggleSelected}
        onToggleAll={toggleAllOnPage}
        page={page}
        totalPages={totalPages}
        totalCount={filteredOrders.length}
        onPageChange={setPage}
        onView={(order) => navigate(`/purchases/orders/${order.id}`)}
        onEditDraft={(order) =>
          navigate(`/purchases/orders/new?draft=${order.id}`)
        }
        onDuplicate={handleDuplicate}
        onReceive={setReceivingOrder}
        onPrint={(order) =>
          printPurchaseOrder(order, getSupplier(order.supplierId))
        }
      />

      {/* Bug fix: modal endi natijani KUTADI va faqat muvaffaqiyatli
          saqlangandan keyin o'zi yopiladi (onClose) — shu sabab bu yerda
          natija tekshirilmasdan turib avvaldan yopilmaydi. */}
      <ReceiveGoodsModal
        open={!!receivingOrder}
        order={receivingOrder}
        warehouses={warehouses}
        onClose={() => setReceivingOrder(null)}
        onConfirm={(payload) => actions.receiveOrder(payload, currentUser)}
      />
    </div>
  );
};

export default PurchaseOrders;
