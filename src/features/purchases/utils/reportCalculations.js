// Enterprise Reports & Analytics — yagona hisoblash dvigateli. Barcha
// hisobot/tahlil funksiyalari mavjud formulalardan (purchaseCalculations,
// budgetCalculations) foydalanadi — mantiq ikki joyda yozilmaydi, faqat
// guruhlash/agregatsiya qatlami shu yerda qo'shiladi.

import { PURCHASE_STATUSES, PURCHASE_STATUS_LABELS } from "../constants/purchaseStatuses";
import { getDepartmentLabel } from "../constants/departments";
import {
  calculateLineSubtotal,
  calculateOrderTotals,
  getAgingBucket,
  getInvoiceRemainingInBaseCurrency,
} from "./purchaseCalculations";
import { normalizeNumber } from "./purchaseMoney";

const MONTH_LABELS = [
  "Yan", "Fev", "Mar", "Apr", "May", "Iyn",
  "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek",
];

const QUARTER_LABELS = ["I chorak", "II chorak", "III chorak", "IV chorak"];

// ---------- Bazaviy yordamchilar ----------

export const getOrderBaseTotal = (order = {}) =>
  Math.round(calculateOrderTotals(order).total * (normalizeNumber(order.exchangeRate) || 1));

const getProductCategory = (item, products) =>
  products.find((product) => product.id === item.productId)?.category || "Boshqa";

export const withinDateRange = (dateValue, from, to) => {
  if (!from && !to) return true;
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return false;
  if (from && date < new Date(from)) return false;

  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (date > end) return false;
  }

  return true;
};

export const DEFAULT_REPORT_FILTERS = {
  dateFrom: "",
  dateTo: "",
  supplierId: "all",
  category: "all",
  department: "all",
  project: "all",
  warehouseId: "all",
  currency: "all",
  status: "all",
};

// PDF 73/77: barcha hisobot/tahlillarning YAGONA filtr manbai — Sana oralig'i,
// Yetkazib beruvchi, Kategoriya, Bo'lim, Loyiha, Ombor, Valyuta, Holat.
export const filterOrdersForReports = (orders = [], filters = {}, { products = [] } = {}) =>
  orders.filter((order) => {
    if (filters.status && filters.status !== "all" && order.status !== filters.status) {
      return false;
    }

    if (
      filters.supplierId &&
      filters.supplierId !== "all" &&
      order.supplierId !== filters.supplierId
    ) {
      return false;
    }

    if (
      filters.department &&
      filters.department !== "all" &&
      (order.department || "") !== filters.department
    ) {
      return false;
    }

    if (
      filters.project &&
      filters.project !== "all" &&
      (order.project || "").trim() !== filters.project.trim()
    ) {
      return false;
    }

    if (
      filters.warehouseId &&
      filters.warehouseId !== "all" &&
      order.warehouseId !== filters.warehouseId
    ) {
      return false;
    }

    if (
      filters.currency &&
      filters.currency !== "all" &&
      (order.currency || "UZS") !== filters.currency
    ) {
      return false;
    }

    if (
      filters.category &&
      filters.category !== "all" &&
      !(order.items || []).some(
        (item) => getProductCategory(item, products) === filters.category,
      )
    ) {
      return false;
    }

    if (!withinDateRange(order.createdAt, filters.dateFrom, filters.dateTo)) {
      return false;
    }

    return true;
  });

export const getRelatedByOrderIds = (records = [], orderIds) =>
  records.filter((entry) => orderIds.has(entry.orderId));

// ---------- 1. Purchase Summary ----------

export const buildPurchaseSummary = (orders = []) => {
  const active = orders.filter((order) => order.status !== PURCHASE_STATUSES.cancelled);
  const totalSpend = active.reduce((sum, order) => sum + getOrderBaseTotal(order), 0);
  const totalOrders = orders.length;
  const avgOrderValue = active.length ? Math.round(totalSpend / active.length) : 0;
  const supplierIds = new Set(orders.map((order) => order.supplierId));

  const byStatus = Object.values(PURCHASE_STATUSES).map((status) => ({
    status,
    label: PURCHASE_STATUS_LABELS[status],
    count: orders.filter((order) => order.status === status).length,
  })).filter((entry) => entry.count > 0);

  const totalItems = active.reduce((sum, order) => sum + (order.items || []).length, 0);

  return {
    totalOrders,
    activeOrders: active.length,
    cancelledOrders: totalOrders - active.length,
    totalSpend,
    avgOrderValue,
    supplierCount: supplierIds.size,
    totalItems,
    byStatus,
  };
};

// ---------- 2/19/20/21. Purchase Trend — Monthly / Quarterly / Annual ----------

export const PERIOD_TYPES = {
  monthly: "monthly",
  quarterly: "quarterly",
  annual: "annual",
};

const getPeriodKey = (dateValue, periodType) => {
  const date = new Date(dateValue);

  if (periodType === PERIOD_TYPES.quarterly) {
    return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
  }

  if (periodType === PERIOD_TYPES.annual) {
    return `${date.getFullYear()}`;
  }

  return `${date.getFullYear()}-${date.getMonth()}`;
};

const getPeriodLabel = (dateValue, periodType) => {
  const date = new Date(dateValue);

  if (periodType === PERIOD_TYPES.quarterly) {
    return `${QUARTER_LABELS[Math.floor(date.getMonth() / 3)]} ${date.getFullYear()}`;
  }

  if (periodType === PERIOD_TYPES.annual) {
    return `${date.getFullYear()}`;
  }

  return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
};

// PDF 2/72-73: xarid dinamikasi — oylik/choraklik/yillik, o'sish foizi bilan.
export const buildPurchaseTrend = (orders = [], periodType = PERIOD_TYPES.monthly, periods = 6) => {
  const now = new Date();
  const active = orders.filter((order) => order.status !== PURCHASE_STATUSES.draft);

  const stepMonths = periodType === PERIOD_TYPES.quarterly ? 3 : periodType === PERIOD_TYPES.annual ? 12 : 1;
  const count = periodType === PERIOD_TYPES.annual ? Math.min(periods, 5) : periods;

  const series = Array.from({ length: count }, (_, index) => {
    const anchor = new Date(now.getFullYear(), now.getMonth() - index * stepMonths, 1);
    const key = getPeriodKey(anchor, periodType);

    const matching = active.filter((order) => getPeriodKey(order.createdAt, periodType) === key);
    const total = matching.reduce((sum, order) => sum + getOrderBaseTotal(order), 0);

    return {
      key,
      label: getPeriodLabel(anchor, periodType),
      total,
      count: matching.length,
    };
  }).reverse();

  const last = series[series.length - 1]?.total || 0;
  const prev = series[series.length - 2]?.total || 0;
  const growthPercent = prev > 0 ? ((last - prev) / prev) * 100 : last > 0 ? 100 : 0;

  return { series, growthPercent };
};

// PDF 72-73 (Comparison Reports): joriy davr vs oldingi davr, asosiy
// ko'rsatkichlar bo'yicha yonma-yon taqqoslash.
export const buildPeriodComparison = (orders = [], periodType = PERIOD_TYPES.monthly) => {
  const trend = buildPurchaseTrend(orders, periodType, 2);
  const [previous, current] = trend.series;

  const growth = (a, b) => (b > 0 ? ((a - b) / b) * 100 : a > 0 ? 100 : 0);

  return {
    current: current || { label: "—", total: 0, count: 0 },
    previous: previous || { label: "—", total: 0, count: 0 },
    spendGrowthPercent: growth(current?.total || 0, previous?.total || 0),
    orderGrowthPercent: growth(current?.count || 0, previous?.count || 0),
  };
};

// ---------- 3/4. Supplier Performance & Rating ----------

const getOrderLeadTimeDays = (order, receipts) => {
  const orderReceipts = receipts
    .filter((entry) => entry.orderId === order.id)
    .map((entry) => entry.receivedAt)
    .sort();

  if (!orderReceipts.length) return null;

  const days = (new Date(orderReceipts[0]) - new Date(order.createdAt)) / (1000 * 60 * 60 * 24);

  return Number.isFinite(days) ? Math.max(days, 0) : null;
};

const getOrderReceivedBaseQty = (order) =>
  (order.items || []).reduce(
    (sum, item) =>
      sum +
      normalizeNumber(item.receivedQty) +
      normalizeNumber(item.damagedQty) +
      normalizeNumber(item.missingQty),
    0,
  );

const getOrderDamagedBaseQty = (order) =>
  (order.items || []).reduce((sum, item) => sum + normalizeNumber(item.damagedQty), 0);

// PDF 74: har bir supplier bo'yicha operatsion ko'rsatkichlar — buyurtma
// soni, sarf, o'z vaqtida yetkazish %, o'rtacha yetkazish muddati, qaytarish/
// buzuq foizi.
export const buildSupplierPerformance = (
  orders = [],
  { suppliers = [], receipts = [], returns = [] } = {},
) => {
  const supplierIds = new Set(orders.map((order) => order.supplierId));

  return Array.from(supplierIds)
    .map((supplierId) => {
      const supplier = suppliers.find((entry) => entry.id === supplierId);
      const supplierOrders = orders.filter((order) => order.supplierId === supplierId);
      const activeOrders = supplierOrders.filter(
        (order) => order.status !== PURCHASE_STATUSES.cancelled,
      );

      const totalSpend = activeOrders.reduce((sum, order) => sum + getOrderBaseTotal(order), 0);

      const deliveredOrders = supplierOrders.filter((order) =>
        receipts.some((entry) => entry.orderId === order.id),
      );

      const onTimeCount = deliveredOrders.filter((order) => {
        const orderReceipts = receipts
          .filter((entry) => entry.orderId === order.id)
          .map((entry) => entry.receivedAt)
          .sort();
        const firstReceivedAt = orderReceipts[0];

        return !order.expectedDate || !firstReceivedAt
          ? true
          : firstReceivedAt.slice(0, 10) <= order.expectedDate;
      }).length;

      const leadTimes = deliveredOrders
        .map((order) => getOrderLeadTimeDays(order, receipts))
        .filter((value) => value !== null);

      const avgLeadTimeDays = leadTimes.length
        ? Math.round((leadTimes.reduce((sum, value) => sum + value, 0) / leadTimes.length) * 10) / 10
        : null;

      const receivedBaseQty = supplierOrders.reduce(
        (sum, order) => sum + getOrderReceivedBaseQty(order),
        0,
      );
      const damagedBaseQty = supplierOrders.reduce(
        (sum, order) => sum + getOrderDamagedBaseQty(order),
        0,
      );

      const supplierReturns = returns.filter((entry) => entry.supplierId === supplierId);
      const returnValue = supplierReturns.reduce((sum, entry) => sum + normalizeNumber(entry.total), 0);

      return {
        supplierId,
        supplier,
        orderCount: supplierOrders.length,
        totalSpend,
        onTimePercent: deliveredOrders.length
          ? Math.round((onTimeCount / deliveredOrders.length) * 100)
          : null,
        avgLeadTimeDays,
        promisedLeadTimeDays: supplier?.leadTimeDays ?? null,
        damageRate: receivedBaseQty > 0 ? Math.round((damagedBaseQty / receivedBaseQty) * 1000) / 10 : 0,
        returnCount: supplierReturns.length,
        returnValue,
      };
    })
    .sort((a, b) => b.totalSpend - a.totalSpend);
};

// PDF 74 (Supplier Rating): tarkibiy reyting — statik score + operatsion
// ko'rsatkichlar (o'z vaqtida yetkazish, buzuq foizi) tenglashtirilib,
// 0-100 kompozit ball hisoblanadi. Alohida "Performance" (xom ko'rsatkichlar)
// dan farqli — bu YAGONA saralanadigan reyting ustuvorligi.
export const buildSupplierRating = (performanceRows = []) =>
  performanceRows
    .map((row) => {
      const onTimeScore = row.onTimePercent ?? 70;
      const damageScore = Math.max(100 - row.damageRate * 4, 0);
      const staticScore = row.supplier?.score ?? 70;

      const compositeRating = Math.round(
        staticScore * 0.4 + onTimeScore * 0.35 + damageScore * 0.25,
      );

      return { ...row, compositeRating };
    })
    .sort((a, b) => b.compositeRating - a.compositeRating);

// ---------- 5/6/7. Category / Department / Project Spending ----------

export const buildCategorySpending = (orders = [], products = []) => {
  const map = new Map();

  orders
    .filter((order) => order.status !== PURCHASE_STATUSES.cancelled)
    .forEach((order) => {
      const rate = normalizeNumber(order.exchangeRate) || 1;

      (order.items || []).forEach((item) => {
        const category = getProductCategory(item, products);
        const value = Math.round(calculateLineSubtotal(item) * rate);

        map.set(category, (map.get(category) || 0) + value);
      });
    });

  return Array.from(map.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
};

const buildGroupedSpending = (orders, getKey, getLabel) => {
  const map = new Map();

  orders
    .filter((order) => order.status !== PURCHASE_STATUSES.cancelled)
    .forEach((order) => {
      const key = getKey(order) || "—";

      map.set(key, (map.get(key) || 0) + getOrderBaseTotal(order));
    });

  return Array.from(map.entries())
    .map(([key, total]) => ({ key, label: getLabel(key), total }))
    .sort((a, b) => b.total - a.total);
};

export const buildDepartmentSpending = (orders = []) =>
  buildGroupedSpending(
    orders,
    (order) => order.department || "",
    (key) => (key ? getDepartmentLabel(key) : "Belgilanmagan"),
  );

export const buildProjectSpending = (orders = []) =>
  buildGroupedSpending(
    orders,
    (order) => (order.project || "").trim(),
    (key) => key || "Belgilanmagan",
  );

// ---------- 8. Invoice Analysis ----------

export const buildInvoiceAnalysis = (invoices = []) => {
  const totalInvoiced = invoices.reduce(
    (sum, invoice) => sum + getInvoiceRemainingInBaseCurrency({ ...invoice, paidAmount: 0 }),
    0,
  );

  const byStatus = ["pending", "matched", "mismatch", "partially_paid", "paid"].map((status) => ({
    status,
    count: invoices.filter((invoice) => invoice.status === status).length,
    amount: invoices
      .filter((invoice) => invoice.status === status)
      .reduce((sum, invoice) => sum + normalizeNumber(invoice.amount) * (normalizeNumber(invoice.exchangeRate) || 1), 0),
  })).filter((entry) => entry.count > 0);

  const mismatched = invoices.filter((invoice) => invoice.matching && !invoice.matching.matched);
  const totalDelta = mismatched.reduce((sum, invoice) => sum + Math.abs(normalizeNumber(invoice.matching?.delta)), 0);

  return {
    totalInvoiced,
    invoiceCount: invoices.length,
    byStatus,
    mismatchedCount: mismatched.length,
    mismatchedDelta: totalDelta,
    matchRate: invoices.length
      ? Math.round(((invoices.length - mismatched.length) / invoices.length) * 100)
      : 100,
  };
};

// ---------- 9. Payment Analysis ----------

export const buildPaymentAnalysis = (invoices = []) => {
  const totalPaid = invoices.reduce((sum, invoice) => sum + normalizeNumber(invoice.paidAmount), 0);
  const totalOutstanding = invoices.reduce(
    (sum, invoice) => sum + getInvoiceRemainingInBaseCurrency(invoice),
    0,
  );

  const agingBuckets = ["current", "d30", "d60", "d60plus"].map((bucket) => ({
    bucket,
    amount: invoices
      .filter((invoice) => getInvoiceRemainingInBaseCurrency(invoice) > 0)
      .filter((invoice) => getAgingBucket(invoice.dueDate) === bucket)
      .reduce((sum, invoice) => sum + getInvoiceRemainingInBaseCurrency(invoice), 0),
  }));

  const methodMap = new Map();

  invoices.forEach((invoice) => {
    (invoice.payments || []).forEach((payment) => {
      const method = payment.method || "boshqa";

      methodMap.set(method, (methodMap.get(method) || 0) + normalizeNumber(payment.amount));
    });
  });

  const allPayments = invoices.flatMap((invoice) =>
    (invoice.payments || []).map((payment) => ({
      ...payment,
      invoiceCreatedAt: invoice.createdAt,
    })),
  );

  const avgDaysToPay = allPayments.length
    ? Math.round(
        allPayments.reduce((sum, payment) => {
          const days = (new Date(payment.paidAt) - new Date(payment.invoiceCreatedAt)) / (1000 * 60 * 60 * 24);

          return sum + Math.max(days, 0);
        }, 0) / allPayments.length,
      )
    : null;

  return {
    totalPaid,
    totalOutstanding,
    agingBuckets,
    byMethod: Array.from(methodMap.entries()).map(([method, amount]) => ({ method, amount })),
    avgDaysToPay,
    paymentCount: allPayments.length,
  };
};

// ---------- 10. Return Analysis ----------

export const buildReturnAnalysis = (returns = [], orders = []) => {
  const totalLoss = returns.reduce((sum, entry) => sum + normalizeNumber(entry.total), 0);

  const byReason = new Map();

  returns.forEach((entry) => {
    byReason.set(entry.reason, (byReason.get(entry.reason) || 0) + 1);
  });

  const byStatus = ["pending_approval", "completed", "rejected"].map((status) => ({
    status,
    count: returns.filter((entry) => entry.status === status).length,
  })).filter((entry) => entry.count > 0);

  const totalReceivedValue = orders.reduce((sum, order) => sum + getOrderBaseTotal(order), 0);
  const returnRate = totalReceivedValue > 0 ? Math.round((totalLoss / totalReceivedValue) * 1000) / 10 : 0;

  return {
    totalReturns: returns.length,
    totalLoss,
    byReason: Array.from(byReason.entries()).map(([reason, count]) => ({ reason, count })),
    byStatus,
    returnRate,
    topReason: Array.from(byReason.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
  };
};

// ---------- 11. Quality Inspection Analysis ----------

export const buildQualityInspectionAnalysis = (inspections = []) => {
  const allItems = inspections.flatMap((entry) => entry.items || []);

  const byStatus = new Map();
  inspections.forEach((entry) => byStatus.set(entry.status, (byStatus.get(entry.status) || 0) + 1));

  const bySeverity = new Map();
  allItems.forEach((item) => bySeverity.set(item.severity || "medium", (bySeverity.get(item.severity || "medium") || 0) + 1));

  const byAction = new Map();
  allItems.forEach((item) => {
    if (!item.action) return;
    byAction.set(item.action, (byAction.get(item.action) || 0) + 1);
  });

  const byDamageType = new Map();
  allItems.forEach((item) => {
    if (!item.damageType) return;
    byDamageType.set(item.damageType, (byDamageType.get(item.damageType) || 0) + 1);
  });

  const totalDamaged = allItems.reduce((sum, item) => sum + normalizeNumber(item.damagedQty), 0);
  const totalAccepted = allItems.reduce((sum, item) => sum + normalizeNumber(item.acceptedQty), 0);
  const totalRejected = allItems.reduce((sum, item) => sum + normalizeNumber(item.rejectedQty), 0);

  return {
    totalInspections: inspections.length,
    pendingCount: inspections.filter((entry) => entry.status === "pending_inspection").length,
    byStatus: Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })),
    bySeverity: Array.from(bySeverity.entries()).map(([severity, count]) => ({ severity, count })),
    byAction: Array.from(byAction.entries()).map(([action, count]) => ({ action, count })),
    byDamageType: Array.from(byDamageType.entries()).map(([damageType, count]) => ({ damageType, count })),
    totalDamaged,
    totalAccepted,
    totalRejected,
    acceptanceRate: totalDamaged > 0 ? Math.round((totalAccepted / totalDamaged) * 100) : 0,
  };
};

// ---------- 12. Receiving Analysis ----------

export const buildReceivingAnalysis = (receipts = [], orders = []) => {
  const fullCount = receipts.filter((entry) => entry.type === "full").length;
  const partialCount = receipts.filter((entry) => entry.type === "partial").length;

  const lags = receipts
    .map((receipt) => {
      const order = orders.find((entry) => entry.id === receipt.orderId);

      if (!order?.expectedDate) return null;

      const days = (new Date(receipt.receivedAt) - new Date(order.expectedDate)) / (1000 * 60 * 60 * 24);

      return Number.isFinite(days) ? days : null;
    })
    .filter((value) => value !== null);

  const onTimeCount = lags.filter((value) => value <= 0).length;

  return {
    totalReceipts: receipts.length,
    fullCount,
    partialCount,
    onTimePercent: lags.length ? Math.round((onTimeCount / lags.length) * 100) : null,
    avgLagDays: lags.length
      ? Math.round((lags.reduce((sum, value) => sum + value, 0) / lags.length) * 10) / 10
      : null,
  };
};

// ---------- 13. Lead Time Analysis ----------

export const buildLeadTimeAnalysis = (performanceRows = []) => {
  const withLeadTime = performanceRows.filter((row) => row.avgLeadTimeDays !== null);

  const avgLeadTimeDays = withLeadTime.length
    ? Math.round(
        (withLeadTime.reduce((sum, row) => sum + row.avgLeadTimeDays, 0) / withLeadTime.length) * 10,
      ) / 10
    : null;

  return {
    avgLeadTimeDays,
    bySupplier: withLeadTime
      .map((row) => ({
        supplierId: row.supplierId,
        name: row.supplier?.name || row.supplierId,
        avgLeadTimeDays: row.avgLeadTimeDays,
        promisedLeadTimeDays: row.promisedLeadTimeDays,
        variance: row.promisedLeadTimeDays
          ? Math.round((row.avgLeadTimeDays - row.promisedLeadTimeDays) * 10) / 10
          : null,
      }))
      .sort((a, b) => b.avgLeadTimeDays - a.avgLeadTimeDays),
  };
};

// ---------- 14. Price Trend (per product) ----------

export const buildPriceTrend = (orders = [], productId) => {
  const points = orders
    .filter((order) => order.status !== PURCHASE_STATUSES.cancelled)
    .flatMap((order) =>
      (order.items || [])
        .filter((item) => item.productId === productId)
        .map((item) => ({
          date: order.createdAt,
          price: normalizeNumber(item.price),
          orderNumber: order.number,
        })),
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return points.map((point, index) => ({
    ...point,
    changePercent:
      index > 0 && points[index - 1].price
        ? Math.round(((point.price - points[index - 1].price) / points[index - 1].price) * 1000) / 10
        : 0,
  }));
};

// ---------- 15. Cost Trend / Cost Breakdown ----------

export const buildCostTrend = (orders = [], periodType = PERIOD_TYPES.monthly, periods = 6) => {
  const now = new Date();
  const active = orders.filter((order) => order.status !== PURCHASE_STATUSES.draft && order.status !== PURCHASE_STATUSES.cancelled);
  const stepMonths = periodType === PERIOD_TYPES.quarterly ? 3 : periodType === PERIOD_TYPES.annual ? 12 : 1;

  return Array.from({ length: periods }, (_, index) => {
    const anchor = new Date(now.getFullYear(), now.getMonth() - index * stepMonths, 1);
    const key = getPeriodKey(anchor, periodType);
    const matching = active.filter((order) => getPeriodKey(order.createdAt, periodType) === key);

    const totals = matching.reduce(
      (acc, order) => {
        const rate = normalizeNumber(order.exchangeRate) || 1;
        const orderTotals = calculateOrderTotals(order);

        return {
          productCost: acc.productCost + Math.round(orderTotals.linesSubtotal * rate),
          tax: acc.tax + Math.round(orderTotals.taxAmount * rate),
          landedCost: acc.landedCost + Math.round(orderTotals.landedCostTotal * rate),
          discount: acc.discount + Math.round(orderTotals.orderDiscount * rate),
        };
      },
      { productCost: 0, tax: 0, landedCost: 0, discount: 0 },
    );

    return { key, label: getPeriodLabel(anchor, periodType), ...totals };
  }).reverse();
};

export const buildCostBreakdown = (orders = []) => {
  const active = orders.filter((order) => order.status !== PURCHASE_STATUSES.cancelled);

  return active.reduce(
    (acc, order) => {
      const rate = normalizeNumber(order.exchangeRate) || 1;
      const totals = calculateOrderTotals(order);

      return {
        productCost: acc.productCost + Math.round(totals.linesSubtotal * rate),
        tax: acc.tax + Math.round(totals.taxAmount * rate),
        landedCost: acc.landedCost + Math.round(totals.landedCostTotal * rate),
        discount: acc.discount + Math.round(totals.orderDiscount * rate),
      };
    },
    { productCost: 0, tax: 0, landedCost: 0, discount: 0 },
  );
};

// ---------- 16/17. Top Purchased Products & Top Suppliers ----------

export const buildTopProducts = (orders = [], products = [], limit = 10) => {
  const map = new Map();

  orders
    .filter((order) => order.status !== PURCHASE_STATUSES.cancelled)
    .forEach((order) => {
      const rate = normalizeNumber(order.exchangeRate) || 1;

      (order.items || []).forEach((item) => {
        const key = item.productId || item.sku || item.name;
        const existing = map.get(key) || {
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          totalQty: 0,
          totalSpend: 0,
          orderCount: 0,
        };

        existing.totalQty += normalizeNumber(item.quantity) * (normalizeNumber(item.unitFactor) || 1);
        existing.totalSpend += Math.round(calculateLineSubtotal(item) * rate);
        existing.orderCount += 1;

        map.set(key, existing);
      });
    });

  return Array.from(map.values())
    .map((entry) => ({
      ...entry,
      category: products.find((product) => product.id === entry.productId)?.category || "",
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, limit);
};

export const buildTopSuppliers = (performanceRows = [], limit = 10) =>
  performanceRows.slice(0, limit);

// ---------- Executive KPI / Analytics helpers ----------

export const getGrowthPercent = (current = 0, previous = 0) => {
  if (previous > 0) return ((current - previous) / previous) * 100;

  return current > 0 ? 100 : 0;
};

export const buildExecutiveKpis = ({
  summary,
  trend,
  performanceRows = [],
  returnAnalysis,
  receivingAnalysis,
  budgetUtilizationPercent = null,
}) => {
  const avgSupplierScore = performanceRows.length
    ? Math.round(
        performanceRows.reduce((sum, row) => sum + (row.supplier?.score || 0), 0) / performanceRows.length,
      )
    : 0;

  const avgLeadTimeDays = (() => {
    const withLeadTime = performanceRows.filter((row) => row.avgLeadTimeDays !== null);

    return withLeadTime.length
      ? Math.round(
          (withLeadTime.reduce((sum, row) => sum + row.avgLeadTimeDays, 0) / withLeadTime.length) * 10,
        ) / 10
      : null;
  })();

  const damageRate = performanceRows.length
    ? Math.round(
        (performanceRows.reduce((sum, row) => sum + row.damageRate, 0) / performanceRows.length) * 10,
      ) / 10
    : 0;

  return {
    totalSpend: summary.totalSpend,
    growthPercent: trend.growthPercent,
    avgOrderValue: summary.avgOrderValue,
    avgSupplierScore,
    avgLeadTimeDays,
    returnRate: returnAnalysis.returnRate,
    damageRate,
    onTimeReceivingPercent: receivingAnalysis.onTimePercent,
    budgetUtilizationPercent,
  };
};
