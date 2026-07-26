// PDF 73-80 (Enterprise Reports & Analytics): markaziy hook — mavjud
// usePurchasesStore ma'lumotini o'qiydi (yagona manba, nusxa saqlanmaydi),
// filtr holatini yuritadi va barcha hisobot/tahlil natijalarini
// reportCalculations.js dvigatelidan memoized holda qaytaradi.

import { useMemo, useState } from "react";

import usePurchasesStore from "./usePurchasesStore";
import { PURCHASE_DEPARTMENTS } from "../constants/departments";
import { PURCHASE_STATUSES, PURCHASE_STATUS_LABELS } from "../constants/purchaseStatuses";
import { PURCHASE_CURRENCIES } from "../constants/currencies";
import {
  computeBudgetConsumption,
  getBudgetPeriodLabel,
  getBudgetScopeLabel,
  resolveBudgetStatus,
} from "../utils/budgetCalculations";
import { BUDGET_ENFORCEMENT } from "../constants/budgets";
import {
  DEFAULT_REPORT_FILTERS,
  PERIOD_TYPES,
  buildCategorySpending,
  buildCostBreakdown,
  buildCostTrend,
  buildDepartmentSpending,
  buildExecutiveKpis,
  buildInvoiceAnalysis,
  buildLeadTimeAnalysis,
  buildPaymentAnalysis,
  buildPeriodComparison,
  buildPriceTrend,
  buildProjectSpending,
  buildPurchaseSummary,
  buildPurchaseTrend,
  buildQualityInspectionAnalysis,
  buildReceivingAnalysis,
  buildReturnAnalysis,
  buildSupplierPerformance,
  buildSupplierRating,
  buildTopProducts,
  buildTopSuppliers,
  filterOrdersForReports,
  getRelatedByOrderIds,
} from "../utils/reportCalculations";

export const usePurchaseReports = () => {
  const store = usePurchasesStore();
  const { orders, invoices, returns, receipts, inspections, products, suppliers, budgets, getSupplier, warehouses } = store;

  const [filters, setFilters] = useState(DEFAULT_REPORT_FILTERS);
  const [periodType, setPeriodType] = useState(PERIOD_TYPES.monthly);

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => setFilters(DEFAULT_REPORT_FILTERS);

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(([key, value]) => {
        if (key === "dateFrom" || key === "dateTo") return !!value;

        return value && value !== "all";
      }).length,
    [filters],
  );

  // ---------- Filtr variantlari (dinamik — mock ro'yxatga qattiq bog'lanmaydi) ----------

  const filterOptions = useMemo(() => {
    const categorySet = new Set(products.map((product) => product.category).filter(Boolean));
    const projectSet = new Set(orders.map((order) => (order.project || "").trim()).filter(Boolean));

    return {
      suppliers: suppliers.map((supplier) => ({ value: supplier.id, label: supplier.name })),
      categories: Array.from(categorySet).map((category) => ({ value: category, label: category })),
      departments: PURCHASE_DEPARTMENTS.map((entry) => ({ value: entry.id, label: entry.label })),
      projects: Array.from(projectSet).map((project) => ({ value: project, label: project })),
      warehouses: warehouses.map((warehouse) => ({ value: warehouse.id, label: warehouse.name })),
      currencies: PURCHASE_CURRENCIES.map((currency) => ({ value: currency.code, label: currency.code })),
      statuses: Object.values(PURCHASE_STATUSES).map((status) => ({
        value: status,
        label: PURCHASE_STATUS_LABELS[status],
      })),
    };
  }, [products, orders, suppliers, warehouses]);

  // ---------- Filtrlangan asosiy to'plam ----------

  const filteredOrders = useMemo(
    () => filterOrdersForReports(orders, filters, { products }),
    [orders, filters, products],
  );

  const filteredOrderIds = useMemo(
    () => new Set(filteredOrders.map((order) => order.id)),
    [filteredOrders],
  );

  const filteredInvoices = useMemo(
    () => getRelatedByOrderIds(invoices, filteredOrderIds),
    [invoices, filteredOrderIds],
  );
  const filteredReturns = useMemo(
    () => getRelatedByOrderIds(returns, filteredOrderIds),
    [returns, filteredOrderIds],
  );
  const filteredReceipts = useMemo(
    () => getRelatedByOrderIds(receipts, filteredOrderIds),
    [receipts, filteredOrderIds],
  );
  const filteredInspections = useMemo(
    () => getRelatedByOrderIds(inspections, filteredOrderIds),
    [inspections, filteredOrderIds],
  );

  // ---------- Hisobotlar ----------

  const summary = useMemo(() => buildPurchaseSummary(filteredOrders), [filteredOrders]);

  const trend = useMemo(
    () => buildPurchaseTrend(filteredOrders, periodType),
    [filteredOrders, periodType],
  );

  const periodComparison = useMemo(
    () => buildPeriodComparison(filteredOrders, periodType),
    [filteredOrders, periodType],
  );

  const supplierPerformance = useMemo(
    () =>
      buildSupplierPerformance(filteredOrders, {
        suppliers,
        receipts: filteredReceipts,
        returns: filteredReturns,
      }),
    [filteredOrders, suppliers, filteredReceipts, filteredReturns],
  );

  const supplierRating = useMemo(
    () => buildSupplierRating(supplierPerformance),
    [supplierPerformance],
  );

  const categorySpending = useMemo(
    () => buildCategorySpending(filteredOrders, products),
    [filteredOrders, products],
  );
  const departmentSpending = useMemo(() => buildDepartmentSpending(filteredOrders), [filteredOrders]);
  const projectSpending = useMemo(() => buildProjectSpending(filteredOrders), [filteredOrders]);

  const invoiceAnalysis = useMemo(() => buildInvoiceAnalysis(filteredInvoices), [filteredInvoices]);
  const paymentAnalysis = useMemo(() => buildPaymentAnalysis(filteredInvoices), [filteredInvoices]);
  const returnAnalysis = useMemo(
    () => buildReturnAnalysis(filteredReturns, filteredOrders),
    [filteredReturns, filteredOrders],
  );
  const qualityAnalysis = useMemo(
    () => buildQualityInspectionAnalysis(filteredInspections),
    [filteredInspections],
  );
  const receivingAnalysis = useMemo(
    () => buildReceivingAnalysis(filteredReceipts, filteredOrders),
    [filteredReceipts, filteredOrders],
  );
  const leadTimeAnalysis = useMemo(
    () => buildLeadTimeAnalysis(supplierPerformance),
    [supplierPerformance],
  );

  const costTrend = useMemo(
    () => buildCostTrend(filteredOrders, periodType),
    [filteredOrders, periodType],
  );
  const costBreakdown = useMemo(() => buildCostBreakdown(filteredOrders), [filteredOrders]);

  const topProducts = useMemo(
    () => buildTopProducts(filteredOrders, products),
    [filteredOrders, products],
  );
  const topSuppliers = useMemo(() => buildTopSuppliers(supplierPerformance), [supplierPerformance]);

  // Byudjet ishlashi — davr mantig'i budgetCalculations ichida o'zining
  // sanasiga ega, shu sabab TO'LIQ (filtrlanmagan) orders to'plami ustida
  // hisoblanadi, faqat scope moduldagi joriy filtrlarga mos kelsa ko'rsatiladi.
  const budgetPerformance = useMemo(
    () =>
      budgets
        .filter((budget) => budget.active)
        .map((budget) => {
          const consumption = computeBudgetConsumption(budget, orders, { products });
          const status = resolveBudgetStatus(
            consumption.utilizationPercent,
            budget.hardLimit ? BUDGET_ENFORCEMENT.hard : BUDGET_ENFORCEMENT.soft,
          );

          return {
            budget,
            consumption,
            status,
            periodLabel: getBudgetPeriodLabel(budget),
            scopeLabel: getBudgetScopeLabel(budget, { getSupplier }),
          };
        })
        .sort((a, b) => b.consumption.utilizationPercent - a.consumption.utilizationPercent),
    [budgets, orders, products, getSupplier],
  );

  const avgBudgetUtilization = budgetPerformance.length
    ? Math.round(
        budgetPerformance.reduce((sum, entry) => sum + entry.consumption.utilizationPercent, 0) /
          budgetPerformance.length,
      )
    : null;

  const executiveKpis = useMemo(
    () =>
      buildExecutiveKpis({
        summary,
        trend,
        performanceRows: supplierPerformance,
        returnAnalysis,
        receivingAnalysis,
        budgetUtilizationPercent: avgBudgetUtilization,
      }),
    [summary, trend, supplierPerformance, returnAnalysis, receivingAnalysis, avgBudgetUtilization],
  );

  const getProductPriceTrend = (productId) => buildPriceTrend(filteredOrders, productId);

  return {
    filters,
    setFilter,
    resetFilters,
    activeFilterCount,
    filterOptions,
    periodType,
    setPeriodType,

    filteredOrders,
    filteredInvoices,
    filteredReturns,
    filteredReceipts,
    filteredInspections,

    products,
    suppliers,
    getSupplier,

    summary,
    trend,
    periodComparison,
    supplierPerformance,
    supplierRating,
    categorySpending,
    departmentSpending,
    projectSpending,
    invoiceAnalysis,
    paymentAnalysis,
    returnAnalysis,
    qualityAnalysis,
    receivingAnalysis,
    leadTimeAnalysis,
    costTrend,
    costBreakdown,
    topProducts,
    topSuppliers,
    budgetPerformance,
    executiveKpis,
    getProductPriceTrend,
  };
};

export default usePurchaseReports;
