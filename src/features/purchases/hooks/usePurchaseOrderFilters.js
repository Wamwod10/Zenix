// PDF 2: Purchase Orders Dashboard — filtr, qidiruv, sort, pagination, bulk.

import { useMemo, useState } from "react";

import { calculateOrderTotals } from "../utils/purchaseCalculations";

export const ORDERS_PAGE_SIZE = 10;

const DEFAULT_FILTERS = {
  status: "all",
  supplierId: "all",
  currency: "all",
  warehouseId: "all",
  dateFrom: "",
  dateTo: "",
  search: "",
  sortBy: "date_desc",
};

// PDF 47: sortlashda aralash valyuta — UZS ekvivalenti bo'yicha
const baseTotal = (order) =>
  calculateOrderTotals(order).total * (order.exchangeRate || 1);

const SORTERS = {
  date_desc: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  date_asc: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  total_desc: (a, b) => baseTotal(b) - baseTotal(a),
  total_asc: (a, b) => baseTotal(a) - baseTotal(b),
  expected_asc: (a, b) => new Date(a.expectedDate) - new Date(b.expectedDate),
};

export const SORT_OPTIONS = [
  { value: "date_desc", label: "Sana: yangi → eski" },
  { value: "date_asc", label: "Sana: eski → yangi" },
  { value: "total_desc", label: "Summa: katta → kichik" },
  { value: "total_asc", label: "Summa: kichik → katta" },
  { value: "expected_asc", label: "Yetkazish sanasi" },
];

export const usePurchaseOrderFilters = (orders = [], getSupplier) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const filteredOrders = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    const result = orders.filter((order) => {
      if (filters.status !== "all" && order.status !== filters.status) {
        return false;
      }

      if (
        filters.supplierId !== "all" &&
        order.supplierId !== filters.supplierId
      ) {
        return false;
      }

      if (
        filters.currency !== "all" &&
        (order.currency || "UZS") !== filters.currency
      ) {
        return false;
      }

      if (
        filters.warehouseId !== "all" &&
        order.warehouseId !== filters.warehouseId
      ) {
        return false;
      }

      if (filters.dateFrom && order.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && order.createdAt > `${filters.dateTo}T23:59:59`) {
        return false;
      }

      if (query) {
        const supplierName = getSupplier?.(order.supplierId)?.name || "";
        const haystack = [
          order.number,
          supplierName,
          ...(order.items || []).map((item) => item.name),
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    return [...result].sort(SORTERS[filters.sortBy] || SORTERS.date_desc);
  }, [orders, filters, getSupplier]);

  const totalPages = Math.max(
    Math.ceil(filteredOrders.length / ORDERS_PAGE_SIZE),
    1,
  );
  const safePage = Math.min(page, totalPages);

  const pagedOrders = useMemo(
    () =>
      filteredOrders.slice(
        (safePage - 1) * ORDERS_PAGE_SIZE,
        safePage * ORDERS_PAGE_SIZE,
      ),
    [filteredOrders, safePage],
  );

  const toggleSelected = (orderId) => {
    setSelectedIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId],
    );
  };

  const toggleAllOnPage = () => {
    const pageIds = pagedOrders.map((order) => order.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allSelected
        ? current.filter((id) => !pageIds.includes(id))
        : [...new Set([...current, ...pageIds])],
    );
  };

  const clearSelection = () => setSelectedIds([]);

  return {
    filters,
    setFilter,
    resetFilters,
    filteredOrders,
    pagedOrders,
    page: safePage,
    setPage,
    totalPages,
    selectedIds,
    toggleSelected,
    toggleAllOnPage,
    clearSelection,
  };
};

export default usePurchaseOrderFilters;
