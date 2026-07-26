// Enterprise AI — Purchases & Suppliers uchun mock hisoblash dvigateli.
// PDF talabi: haqiqiy AI/LLM chaqirilmaydi — barcha "tavsiya"/"xavf"/
// "bashorat" mavjud xarid ma'lumotidan (orders/invoices/budgets/products/
// suppliers) DETERMINISTIK formulalar bilan hisoblanadi, kelajakda backend
// AI xizmatiga almashtirish uchun shu YAGONA joyni o'zgartirish yetarli
// bo'ladi (interfeys — generateAIInsights(context) — o'zgarmaydi).
//
// Mavjud hisob-kitob dvigatellari QAYTA ISHLATILADI (mantiq ikki joyda
// yozilmaydi): calculateOrderTotals/calculateLineSubtotal (purchaseCalculations),
// computeBudgetConsumption (budgetCalculations), getReorderSuggestions
// (purchaseProducts), getSupplierOutstandingDebt.

import {
  calculateLineSubtotal,
  calculateOrderTotals,
  getPriceIncreasePercent,
  getSupplierOutstandingDebt,
  PRICE_WARNING_THRESHOLD,
} from "../utils/purchaseCalculations";
import {
  computeBudgetConsumption,
  getBudgetPeriodLabel,
} from "../utils/budgetCalculations";
import { getReorderSuggestions } from "../data/purchaseProducts";
import { PURCHASE_STATUSES } from "../constants/purchaseStatuses";
import { formatCompactMoney, formatPurchaseDate } from "../utils/purchaseMoney";
import { AI_CATEGORIES, AI_INSIGHT_TYPES, AI_PRIORITY, AI_RISK_LEVELS } from "./aiConstants";

const DAY_MS = 1000 * 60 * 60 * 24;

const clampConfidence = (value) => Math.min(97, Math.max(45, Math.round(value)));

const getOrderBaseTotal = (order) =>
  Math.round(calculateOrderTotals(order).total * (order.exchangeRate || 1));

const isSameMonthOffset = (dateValue, now, monthsAgo) => {
  const date = new Date(dateValue);
  const target = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);

  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth()
  );
};

const sumOrdersInMonth = (orders, now, monthsAgo) =>
  orders
    .filter((order) => isSameMonthOffset(order.createdAt, now, monthsAgo))
    .reduce((sum, order) => sum + getOrderBaseTotal(order), 0);

let sequence = 0;

const createInsight = ({
  id,
  feature,
  category,
  type,
  title,
  message,
  riskLevel = null,
  confidence,
  reasoning,
  suggestedActions = [],
  priority,
  entity = null,
  relatedSupplierIds = [],
  metric = null,
}) => {
  sequence += 1;

  return {
    id,
    feature,
    category,
    type,
    title,
    message,
    riskLevel,
    confidence: clampConfidence(confidence),
    reasoning,
    suggestedActions,
    priority,
    entity,
    relatedSupplierIds,
    metric,
    order: sequence,
  };
};

// ---------- 1. AI Purchase Insights ----------
const buildPurchaseInsights = ({ orders, products, now }) => {
  const results = [];
  const activeOrders = orders.filter(
    (order) =>
      order.status !== PURCHASE_STATUSES.cancelled &&
      order.status !== PURCHASE_STATUSES.draft,
  );

  const thisMonth = sumOrdersInMonth(activeOrders, now, 0);
  const lastMonth = sumOrdersInMonth(activeOrders, now, 1);

  if (lastMonth > 0) {
    const changePercent = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    const displayPercent = Math.max(Math.min(changePercent, 500), -500);
    const displayPercentLabel = `${changePercent > 0 ? "+" : ""}${displayPercent}${Math.abs(changePercent) > 500 ? "+" : ""}%`;

    if (Math.abs(changePercent) >= 10) {
      results.push(
        createInsight({
          id: "purchase-insights-month-trend",
          feature: "purchase-insights",
          category: AI_CATEGORIES.insights,
          type: changePercent > 0 ? AI_INSIGHT_TYPES.insight : AI_INSIGHT_TYPES.opportunity,
          title: changePercent > 0 ? "Xarid hajmi oshmoqda" : "Xarid hajmi kamaymoqda",
          message: `Bu oygi xarid summasi o'tgan oyga nisbatan ${displayPercentLabel} (${formatCompactMoney(thisMonth)} / ${formatCompactMoney(lastMonth)}).`,
          confidence: 60 + Math.min(Math.abs(changePercent), 30),
          reasoning: "Joriy va o'tgan oyda yaratilgan (qoralamadan tashqari) buyurtmalar summasi solishtirildi.",
          priority: Math.abs(changePercent) >= 30 ? AI_PRIORITY.high : AI_PRIORITY.medium,
          suggestedActions: [{ label: "Hisobotlarni ko'rish", to: "/purchases/reports" }],
        }),
      );
    }
  }

  const categoryTotals = {};

  activeOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      const category = product?.category || "Boshqa";

      categoryTotals[category] =
        (categoryTotals[category] || 0) +
        calculateLineSubtotal(item) * (order.exchangeRate || 1);
    });
  });

  const totalSpend = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
  const [topCategory, topCategoryTotal] =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || [];

  if (topCategory && totalSpend > 0) {
    const share = Math.round((topCategoryTotal / totalSpend) * 100);

    if (share >= 40) {
      results.push(
        createInsight({
          id: `purchase-insights-category-concentration-${topCategory}`,
          feature: "purchase-insights",
          category: AI_CATEGORIES.insights,
          type: AI_INSIGHT_TYPES.insight,
          title: "Xarid bitta kategoriyaga jamlangan",
          message: `"${topCategory}" kategoriyasi umumiy xarid summasining ${share}% ni tashkil qiladi.`,
          confidence: 55 + Math.min(share, 35),
          reasoning: "Barcha faol buyurtma qatorlari mahsulot kategoriyasi bo'yicha guruhlandi va ulush hisoblandi.",
          priority: share >= 60 ? AI_PRIORITY.medium : AI_PRIORITY.low,
          suggestedActions: [{ label: "Xarajat tahlilini ko'rish", to: "/purchases/reports" }],
        }),
      );
    }
  }

  return results;
};

// ---------- 2. AI Spending Analysis ----------
const buildSpendingAnalysis = ({ orders, products, now }) => {
  const results = [];
  const activeOrders = orders.filter(
    (order) =>
      order.status !== PURCHASE_STATUSES.cancelled &&
      order.status !== PURCHASE_STATUSES.draft,
  );

  const categoryTotalsFor = (monthsAgo) => {
    const totals = {};

    activeOrders
      .filter((order) => isSameMonthOffset(order.createdAt, now, monthsAgo))
      .forEach((order) => {
        (order.items || []).forEach((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          const category = product?.category || "Boshqa";

          totals[category] =
            (totals[category] || 0) +
            calculateLineSubtotal(item) * (order.exchangeRate || 1);
        });
      });

    return totals;
  };

  const current = categoryTotalsFor(0);
  const previous = categoryTotalsFor(1);

  Object.entries(current).forEach(([category, total]) => {
    const previousTotal = previous[category] || 0;

    if (previousTotal < 100_000 || total < 100_000) return;

    const growthPercent = Math.round(((total - previousTotal) / previousTotal) * 100);

    if (growthPercent >= 25) {
      results.push(
        createInsight({
          id: `spending-analysis-growth-${category}`,
          feature: "spending-analysis",
          category: AI_CATEGORIES.spending,
          type: AI_INSIGHT_TYPES.warning,
          title: `"${category}" xarajati keskin o'sdi`,
          message: `Bu oy "${category}" kategoriyasiga xarajat +${growthPercent}% oshdi (${formatCompactMoney(total)}).`,
          confidence: 55 + Math.min(growthPercent, 35),
          reasoning: "Joriy va o'tgan oy davomidagi kategoriya bo'yicha xarid qatorlari summasi solishtirildi.",
          priority: growthPercent >= 60 ? AI_PRIORITY.high : AI_PRIORITY.medium,
          suggestedActions: [{ label: "Byudjetni tekshirish", to: "/purchases" }],
        }),
      );
    }
  });

  return results;
};

// ---------- 3. AI Supplier Recommendation ----------
const buildSupplierRecommendations = ({ products, suppliers, now }) => {
  const results = [];
  const reorderList = getReorderSuggestions(products);

  reorderList.forEach((product) => {
    // Bug fix: bog'lanishning YAGONA manbasi `supplier.productIds` (Suppliers
    // moduli, foydalanuvchi tomonidan aniq bog'langan) — eski, deprecated
    // `product.supplierIds` (mock/avtomatik bog'lanish) endi ishlatilmaydi
    // (SupplierProducts.jsx/PurchaseOrderWizard.jsx bilan bir xil qoida).
    const linkedSuppliers = suppliers.filter(
      (supplier) => supplier.productIds?.includes(product.id) && !supplier.blocked,
    );

    if (linkedSuppliers.length < 2) return;

    const best = [...linkedSuppliers].sort(
      (a, b) => b.score - a.score || a.leadTimeDays - b.leadTimeDays,
    )[0];

    const currentSupplierName = product.lastPurchase?.supplierName;
    const isAlreadyBest = currentSupplierName === best.name;

    if (isAlreadyBest) return;

    const current = linkedSuppliers.find((entry) => entry.name === currentSupplierName);

    results.push(
      createInsight({
        id: `supplier-recommendation-${product.id}`,
        feature: "supplier-recommendation",
        category: AI_CATEGORIES.supplier,
        type: AI_INSIGHT_TYPES.recommendation,
        title: `"${product.name}" uchun yaxshiroq yetkazib beruvchi bor`,
        message: `${best.name} (reyting ${best.score}/100, yetkazish ${best.leadTimeDays} kun) ${current ? `${current.name}'dan (${current.score}/100, ${current.leadTimeDays} kun) ` : ""}ko'ra yaxshiroq ko'rsatkichga ega.`,
        confidence: 50 + Math.min(best.score - (current?.score || 50), 40),
        reasoning: "Mahsulotga bog'langan yetkazib beruvchilar reyting (score) va yetkazish muddati bo'yicha solishtirildi.",
        priority: best.score - (current?.score || 0) >= 20 ? AI_PRIORITY.high : AI_PRIORITY.medium,
        entity: { type: "product", id: product.id },
        relatedSupplierIds: [current?.id, best.id].filter(Boolean),
        suggestedActions: [
          { label: `${best.name} profilini ko'rish`, to: `/suppliers/${best.id}` },
        ],
      }),
    );
  });

  return results;
};

// ---------- 4. AI Price Recommendation ----------
const buildPriceRecommendations = ({ orders }) => {
  const results = [];
  const activeOrders = orders.filter(
    (order) => order.status !== PURCHASE_STATUSES.cancelled,
  );

  const seenProducts = new Set();

  activeOrders
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((order) => {
      (order.items || []).forEach((item) => {
        if (!item.productId || seenProducts.has(item.productId)) return;

        const increasePercent = getPriceIncreasePercent(item);

        if (increasePercent < PRICE_WARNING_THRESHOLD) return;

        seenProducts.add(item.productId);

        const fairPrice = Math.round((item.lastPrice + item.price) / 2);

        results.push(
          createInsight({
            id: `price-recommendation-${item.productId}`,
            feature: "price-recommendation",
            category: AI_CATEGORIES.price,
            type: AI_INSIGHT_TYPES.warning,
            title: `"${item.name}" narxi keskin oshgan`,
            message: `Oxirgi buyurtmada narx +${increasePercent}% oshgan (${formatCompactMoney(item.lastPrice)} → ${formatCompactMoney(item.price)}). Tavsiya etilgan adolatli narx: ${formatCompactMoney(fairPrice)}.`,
            confidence: 55 + Math.min(increasePercent, 35),
            reasoning: `Narx oshishi PDF chegarasidan (${PRICE_WARNING_THRESHOLD}%) yuqori — oldingi va joriy narx o'rtachasi adolatli narx sifatida taklif qilindi.`,
            priority: increasePercent >= 40 ? AI_PRIORITY.high : AI_PRIORITY.medium,
            entity: { type: "order", id: order.id },
            relatedSupplierIds: [order.supplierId].filter(Boolean),
            suggestedActions: [
              { label: "Buyurtmani ko'rish", to: `/purchases/orders/${order.id}` },
            ],
          }),
        );
      });
    });

  return results;
};

// ---------- 5. AI Budget Recommendation ----------
const buildBudgetRecommendations = ({ budgets, orders, products, now }) => {
  const results = [];

  budgets
    .filter((budget) => budget.active)
    .forEach((budget) => {
      const consumption = computeBudgetConsumption(budget, orders, { products, now });

      if (consumption.allocated <= 0) return;

      if (consumption.forecastPercent >= 100 && consumption.utilizationPercent < 100) {
        results.push(
          createInsight({
            id: `budget-recommendation-forecast-${budget.id}`,
            feature: "budget-recommendation",
            category: AI_CATEGORIES.budget,
            type: AI_INSIGHT_TYPES.prediction,
            title: `"${budget.name}" byudjeti muddatidan oldin tugashi mumkin`,
            message: `Joriy sarf tezligida davr oxirigacha taxminan ${Math.round(consumption.forecastPercent)}% sarflanadi (hozir ${Math.round(consumption.utilizationPercent)}%). ${getBudgetPeriodLabel(budget)}.`,
            confidence: 50 + Math.min(consumption.forecastPercent - 100, 40),
            reasoning: "Davr boshidan hozirgacha sarf tezligi chiziqli tarzda davr oxirigacha proyeksiya qilindi (run-rate).",
            priority: consumption.forecastPercent >= 130 ? AI_PRIORITY.high : AI_PRIORITY.medium,
            entity: { type: "budget", id: budget.id },
            suggestedActions: [{ label: "Byudjetlarni boshqarish", to: "/purchases" }],
          }),
        );
      } else if (consumption.utilizationPercent >= 90 && consumption.utilizationPercent < 100) {
        results.push(
          createInsight({
            id: `budget-recommendation-near-limit-${budget.id}`,
            feature: "budget-recommendation",
            category: AI_CATEGORIES.budget,
            type: AI_INSIGHT_TYPES.warning,
            title: `"${budget.name}" chegaraga yaqinlashdi`,
            message: `${Math.round(consumption.utilizationPercent)}% sarflandi (${formatCompactMoney(consumption.consumed)} / ${formatCompactMoney(consumption.allocated)}). Qolgan: ${formatCompactMoney(consumption.remaining)}.`,
            confidence: 70,
            reasoning: "Byudjet sarfi (consumed) allocated summaga nisbatan hisoblandi (computeBudgetConsumption).",
            priority: AI_PRIORITY.medium,
            entity: { type: "budget", id: budget.id },
            suggestedActions: [{ label: "Byudjetlarni boshqarish", to: "/purchases" }],
          }),
        );
      }
    });

  return results;
};

// ---------- 6. AI Purchase Risk Detection ----------
const buildPurchaseRiskDetection = ({ orders, getSupplier, now }) => {
  const results = [];
  const activeOrders = orders.filter(
    (order) =>
      order.status !== PURCHASE_STATUSES.cancelled &&
      order.status !== PURCHASE_STATUSES.draft,
  );

  // Bitta supplierga jamlanish xavfi (joriy oy davomida >60% xarid)
  const thisMonthOrders = activeOrders.filter((order) => isSameMonthOffset(order.createdAt, now, 0));
  const totalThisMonth = thisMonthOrders.reduce((sum, order) => sum + getOrderBaseTotal(order), 0);
  const bySupplier = {};

  thisMonthOrders.forEach((order) => {
    bySupplier[order.supplierId] = (bySupplier[order.supplierId] || 0) + getOrderBaseTotal(order);
  });

  if (totalThisMonth > 0) {
    Object.entries(bySupplier).forEach(([supplierId, total]) => {
      const share = Math.round((total / totalThisMonth) * 100);

      if (share >= 60 && Object.keys(bySupplier).length > 1) {
        const supplier = getSupplier(supplierId);

        results.push(
          createInsight({
            id: `purchase-risk-supplier-dependency-${supplierId}`,
            feature: "purchase-risk-detection",
            category: AI_CATEGORIES.risk,
            type: AI_INSIGHT_TYPES.risk,
            title: `"${supplier?.name || supplierId}" ga haddan tashqari bog'liqlik`,
            message: `Bu oygi xaridning ${share}% bitta yetkazib beruvchiga to'g'ri keladi — yetkazishda uzilish umumiy zanjirga ta'sir qilishi mumkin.`,
            riskLevel: share >= 80 ? AI_RISK_LEVELS.high : AI_RISK_LEVELS.medium,
            confidence: 55 + Math.min(share - 60, 30),
            reasoning: "Joriy oydagi faol buyurtmalar yetkazib beruvchi bo'yicha guruhlandi va ulush hisoblandi.",
            priority: share >= 80 ? AI_PRIORITY.high : AI_PRIORITY.medium,
            entity: { type: "supplier", id: supplierId },
            relatedSupplierIds: [supplierId],
            suggestedActions: [{ label: "Yetkazib beruvchini ko'rish", to: `/suppliers/${supplierId}` }],
          }),
        );
      }
    });
  }

  // Katta chegirmali, hali tasdiqlanmagan buyurtmalar (anomaliya)
  activeOrders
    .filter((order) => order.status === PURCHASE_STATUSES.pendingApproval)
    .forEach((order) => {
      const riskyItems = (order.items || []).filter((item) => (item.discountPercent || 0) >= 30);

      if (!riskyItems.length) return;

      const maxDiscount = Math.max(...riskyItems.map((item) => item.discountPercent || 0));

      results.push(
        createInsight({
          id: `purchase-risk-discount-anomaly-${order.id}`,
          feature: "purchase-risk-detection",
          category: AI_CATEGORIES.risk,
          type: AI_INSIGHT_TYPES.risk,
          title: `${order.number} buyurtmasida g'ayrioddiy chegirma`,
          message: `${riskyItems.length} ta qatorda chegirma ${maxDiscount}% gacha — odatiy diapazondan yuqori, tekshirish tavsiya etiladi.`,
          riskLevel: maxDiscount >= 50 ? AI_RISK_LEVELS.high : AI_RISK_LEVELS.medium,
          confidence: 55 + Math.min(maxDiscount - 30, 30),
          reasoning: "Qator darajasidagi chegirma foizi 30% chegarasidan yuqori bo'lgan tasdiqqa kutilayotgan buyurtmalar aniqlandi.",
          priority: maxDiscount >= 50 ? AI_PRIORITY.high : AI_PRIORITY.medium,
          entity: { type: "order", id: order.id },
          relatedSupplierIds: [order.supplierId].filter(Boolean),
          suggestedActions: [{ label: "Buyurtmani ko'rish", to: `/purchases/orders/${order.id}` }],
        }),
      );
    });

  return results;
};

// ---------- 7. AI Delivery Risk ----------
const buildDeliveryRisk = ({ orders, getSupplier, now }) => {
  const results = [];

  orders
    .filter((order) =>
      [PURCHASE_STATUSES.sent, PURCHASE_STATUSES.partiallyReceived].includes(order.status),
    )
    .forEach((order) => {
      if (!order.expectedDate) return;

      const daysUntil = Math.ceil((new Date(order.expectedDate) - now) / DAY_MS);
      const supplier = getSupplier(order.supplierId);
      const leadTime = supplier?.leadTimeDays ?? 3;
      const lowScore = (supplier?.score ?? 70) < 60;

      let riskLevel = null;

      if (daysUntil < 0) riskLevel = AI_RISK_LEVELS.critical;
      else if (daysUntil <= 1 && (lowScore || leadTime >= 7)) riskLevel = AI_RISK_LEVELS.high;
      else if (daysUntil <= leadTime && lowScore) riskLevel = AI_RISK_LEVELS.medium;

      if (!riskLevel) return;

      results.push(
        createInsight({
          id: `delivery-risk-${order.id}`,
          feature: "delivery-risk",
          category: AI_CATEGORIES.delivery,
          type: AI_INSIGHT_TYPES.risk,
          title:
            daysUntil < 0
              ? `${order.number} yetkazish muddati o'tib ketdi`
              : `${order.number} kechikish xavfi bor`,
          message:
            daysUntil < 0
              ? `Kutilgan sana ${Math.abs(daysUntil)} kun oldin o'tgan, hali yetkazilmagan (${supplier?.name || "yetkazib beruvchi"}).`
              : `${daysUntil} kundan keyin kutilmoqda. ${supplier?.name || "Yetkazib beruvchi"} reytingi ${supplier?.score ?? "—"}/100, odatiy yetkazish ${leadTime} kun.`,
          riskLevel,
          confidence: riskLevel === AI_RISK_LEVELS.critical ? 90 : 55 + Math.min(leadTime * 3, 30),
          reasoning: "Kutilayotgan sana, yetkazib beruvchining odatiy yetkazish muddati va reytingi solishtirildi.",
          priority: riskLevel === AI_RISK_LEVELS.critical ? AI_PRIORITY.critical : AI_PRIORITY.high,
          entity: { type: "order", id: order.id },
          relatedSupplierIds: [order.supplierId].filter(Boolean),
          suggestedActions: [{ label: "Buyurtmani ko'rish", to: `/purchases/orders/${order.id}` }],
        }),
      );
    });

  return results;
};

// ---------- 8. AI Duplicate Invoice Warning ----------
const buildDuplicateInvoiceWarnings = ({ invoices, getSupplier }) => {
  const results = [];
  const bySupplier = {};

  invoices.forEach((invoice) => {
    if (!invoice.supplierId) return;

    bySupplier[invoice.supplierId] = bySupplier[invoice.supplierId] || [];
    bySupplier[invoice.supplierId].push(invoice);
  });

  Object.entries(bySupplier).forEach(([supplierId, list]) => {
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const a = list[i];
        const b = list[j];

        if (a.orderId === b.orderId) continue;

        const daysApart = Math.abs(new Date(a.createdAt) - new Date(b.createdAt)) / DAY_MS;
        const amountDiffPercent =
          a.amount > 0 ? Math.abs(a.amount - b.amount) / a.amount * 100 : 100;

        if (daysApart <= 5 && amountDiffPercent <= 2) {
          const supplier = getSupplier(supplierId);

          results.push(
            createInsight({
              id: `duplicate-invoice-${[a.id, b.id].sort().join("-")}`,
              feature: "duplicate-invoice-warning",
              category: AI_CATEGORIES.invoice,
              type: AI_INSIGHT_TYPES.warning,
              title: "Ehtimoliy takroriy invoys",
              message: `${a.number} va ${b.number} (${supplier?.name || ""}) bir-biriga juda yaqin summa va sanaga ega — ${formatCompactMoney(a.amount)} / ${formatCompactMoney(b.amount)}, ${Math.round(daysApart)} kun farq bilan.`,
              riskLevel: AI_RISK_LEVELS.medium,
              confidence: 55 + Math.round((5 - daysApart) * 5 + (2 - amountDiffPercent) * 10),
              reasoning: "Bir xil yetkazib beruvchining turli PO'ga tegishli invoyslari summa (±2%) va sana (≤5 kun) bo'yicha solishtirildi.",
              priority: AI_PRIORITY.medium,
              entity: { type: "invoice", id: a.id },
              relatedSupplierIds: [supplierId],
              suggestedActions: [{ label: "Invoyslarni ko'rish", to: "/purchases/invoices" }],
            }),
          );
        }
      }
    }
  });

  return results;
};

// ---------- 9. AI Supplier Health ----------
const buildSupplierHealth = ({ suppliers, orders, receipts, invoices }) => {
  const results = [];

  suppliers.forEach((supplier) => {
    const supplierOrders = orders.filter((order) => order.supplierId === supplier.id);

    if (!supplierOrders.length && !supplier.blocked) return;

    const deliveredOrders = supplierOrders.filter((order) =>
      receipts.some((entry) => entry.orderId === order.id),
    );
    const onTimeCount = deliveredOrders.filter((order) => {
      const firstReceivedAt = receipts
        .filter((entry) => entry.orderId === order.id)
        .map((entry) => entry.receivedAt)
        .sort()[0];

      return !order.expectedDate || !firstReceivedAt
        ? true
        : firstReceivedAt.slice(0, 10) <= order.expectedDate;
    }).length;

    const onTimePercent = deliveredOrders.length
      ? Math.round((onTimeCount / deliveredOrders.length) * 100)
      : null;

    const debt = getSupplierOutstandingDebt(invoices, supplier.id);
    const creditUsedPercent = supplier.creditLimit
      ? Math.min(Math.round((debt / supplier.creditLimit) * 100), 999)
      : 0;

    let riskLevel = AI_RISK_LEVELS.low;
    const reasons = [];

    if (supplier.blocked) {
      riskLevel = AI_RISK_LEVELS.critical;
      reasons.push("bloklangan");
    } else {
      if (supplier.score < 50) {
        riskLevel = AI_RISK_LEVELS.high;
        reasons.push(`past reyting (${supplier.score}/100)`);
      } else if (supplier.score < 70 && riskLevel === AI_RISK_LEVELS.low) {
        riskLevel = AI_RISK_LEVELS.medium;
        reasons.push(`o'rtacha reyting (${supplier.score}/100)`);
      }

      if (onTimePercent !== null && onTimePercent < 60) {
        riskLevel = AI_RISK_LEVELS.high;
        reasons.push(`o'z vaqtida yetkazish past (${onTimePercent}%)`);
      }

      if (creditUsedPercent >= 90) {
        riskLevel = riskLevel === AI_RISK_LEVELS.low ? AI_RISK_LEVELS.medium : riskLevel;
        reasons.push(`kredit limiti ${creditUsedPercent}% ishlatilgan`);
      }
    }

    if (riskLevel === AI_RISK_LEVELS.low && !reasons.length) return;

    results.push(
      createInsight({
        id: `supplier-health-${supplier.id}`,
        feature: "supplier-health",
        category: AI_CATEGORIES.supplier,
        type: riskLevel === AI_RISK_LEVELS.low ? AI_INSIGHT_TYPES.insight : AI_INSIGHT_TYPES.risk,
        title: `${supplier.name}: sog'lomlik holati — ${
          { critical: "kritik", high: "yuqori xavf", medium: "o'rta xavf", low: "yaxshi" }[riskLevel]
        }`,
        message: reasons.length
          ? `Sabab: ${reasons.join(", ")}.`
          : "Barcha ko'rsatkichlar me'yorida.",
        riskLevel,
        confidence: 60 + (deliveredOrders.length ? Math.min(deliveredOrders.length * 5, 30) : 0),
        reasoning: "Reyting (score), o'z vaqtida yetkazish foizi, bloklanganlik va kredit limiti ishlatilishi birlashtirildi.",
        priority:
          riskLevel === AI_RISK_LEVELS.critical
            ? AI_PRIORITY.critical
            : riskLevel === AI_RISK_LEVELS.high
              ? AI_PRIORITY.high
              : AI_PRIORITY.medium,
        entity: { type: "supplier", id: supplier.id },
        relatedSupplierIds: [supplier.id],
        metric: { onTimePercent, creditUsedPercent, score: supplier.score },
        suggestedActions: [{ label: "Yetkazib beruvchi profili", to: `/suppliers/${supplier.id}` }],
      }),
    );
  });

  return results;
};

// ---------- 10. AI Cost Optimization ----------
const buildCostOptimization = ({ products, suppliers, getSupplier }) => {
  const results = [];

  products.forEach((product) => {
    const linkedSuppliers = suppliers.filter(
      (supplier) => supplier.productIds?.includes(product.id) && !supplier.blocked,
    );

    if (linkedSuppliers.length < 2) return;

    const priced = linkedSuppliers
      .map((supplier) => ({
        supplier,
        price: supplier.productOverrides?.[product.id]?.price,
      }))
      .filter((entry) => Number(entry.price) > 0);

    if (priced.length < 2) return;

    const cheapest = [...priced].sort((a, b) => a.price - b.price)[0];
    const currentDefault = priced.find((entry) => entry.price === product.lastPrice) || priced[priced.length - 1];

    if (cheapest.supplier.id === currentDefault.supplier.id) return;

    const savingsPercent = Math.round(
      ((currentDefault.price - cheapest.price) / currentDefault.price) * 100,
    );

    if (savingsPercent < 5) return;

    results.push(
      createInsight({
        id: `cost-optimization-${product.id}`,
        feature: "cost-optimization",
        category: AI_CATEGORIES.cost,
        type: AI_INSIGHT_TYPES.opportunity,
        title: `"${product.name}" bo'yicha tejash imkoniyati`,
        message: `${cheapest.supplier.name} shu mahsulotni ${formatCompactMoney(cheapest.price)} ga taklif qiladi — ${currentDefault.supplier.name}'dan (${formatCompactMoney(currentDefault.price)}) ${savingsPercent}% arzon.`,
        confidence: 50 + Math.min(savingsPercent, 40),
        reasoning: "Bir xil mahsulotga bog'langan yetkazib beruvchilarning individual narx shartlari (productOverrides) solishtirildi.",
        priority: savingsPercent >= 15 ? AI_PRIORITY.high : AI_PRIORITY.medium,
        entity: { type: "product", id: product.id },
        relatedSupplierIds: [currentDefault.supplier.id, cheapest.supplier.id],
        metric: { savingsPercent },
        suggestedActions: [
          { label: `${cheapest.supplier.name} profilini ko'rish`, to: `/suppliers/${cheapest.supplier.id}` },
        ],
      }),
    );
  });

  return results;
};

// ---------- 11. AI Suggested Purchase Timing ----------
const buildSuggestedTiming = ({ products, suppliers, now }) => {
  const results = [];
  const reorderList = getReorderSuggestions(products);

  reorderList.forEach((product) => {
    // Bug fix: deprecated `product.supplierIds` o'rniga `supplier.productIds`
    // (yagona, foydalanuvchi tomonidan bog'langan manba) ishlatiladi.
    const supplier = suppliers.find(
      (entry) => entry.productIds?.includes(product.id) && !entry.blocked,
    );
    const supplierId = supplier?.id;
    const leadTime = supplier?.leadTimeDays ?? 3;

    const stockRatio = product.reorderPoint > 0 ? product.stock / product.reorderPoint : 0;
    const daysOfStockLeft = Math.max(Math.round(stockRatio * leadTime * 2), 0);
    const orderByDate = new Date(now.getTime() + Math.max(daysOfStockLeft - leadTime, 0) * DAY_MS);
    const urgent = daysOfStockLeft <= leadTime;

    results.push(
      createInsight({
        id: `purchase-timing-${product.id}`,
        feature: "purchase-timing",
        category: AI_CATEGORIES.timing,
        type: AI_INSIGHT_TYPES.recommendation,
        title: `"${product.name}" uchun buyurtma vaqti`,
        message: urgent
          ? `Hozir buyurtma bering — qoldiq (${product.stock}) yetkazish muddati (${leadTime} kun) ichida tugashi mumkin.`
          : `${formatPurchaseDate(orderByDate)} sanasigacha buyurtma bering (yetkazish ${leadTime} kun davom etadi).`,
        confidence: 55 + Math.min(leadTime * 4, 30),
        reasoning: "Joriy qoldiq, minimal zaxira nuqtasi (reorderPoint) va yetkazib beruvchining odatiy yetkazish muddati asosida hisoblandi.",
        priority: urgent ? AI_PRIORITY.high : AI_PRIORITY.low,
        entity: { type: "product", id: product.id },
        relatedSupplierIds: supplierId ? [supplierId] : [],
        suggestedActions: [{ label: "Yangi buyurtma yaratish", to: "/purchases/orders/new" }],
      }),
    );
  });

  return results;
};

// ---------- 12. AI Suggested Order Quantity ----------
const buildSuggestedQuantity = ({ products, orders }) => {
  const results = [];
  const reorderList = getReorderSuggestions(products);

  reorderList.forEach((product) => {
    const pastQuantities = orders
      .filter((order) => order.status !== PURCHASE_STATUSES.cancelled)
      .flatMap((order) => order.items || [])
      .filter((item) => item.productId === product.id)
      .map((item) => item.quantity)
      .filter((qty) => qty > 0);

    const avgQty = pastQuantities.length
      ? Math.round(pastQuantities.reduce((sum, qty) => sum + qty, 0) / pastQuantities.length)
      : 0;

    const suggestedQty = Math.max(avgQty, product.suggestedQty, product.moq);

    if (suggestedQty <= 0) return;

    results.push(
      createInsight({
        id: `order-quantity-${product.id}`,
        feature: "order-quantity",
        category: AI_CATEGORIES.quantity,
        type: AI_INSIGHT_TYPES.recommendation,
        title: `"${product.name}" uchun tavsiya etilgan miqdor`,
        message: `${suggestedQty} dona buyurtma berish tavsiya etiladi${avgQty ? ` (o'rtacha tarixiy buyurtma: ${avgQty} dona)` : ""}, min. buyurtma miqdori: ${product.moq}.`,
        confidence: pastQuantities.length ? 55 + Math.min(pastQuantities.length * 5, 30) : 50,
        reasoning: "O'tgan buyurtmalardagi shu mahsulot miqdorining o'rtachasi, zaxira tavsiyasi (reorderPoint*2-stock) va MOQ orasidan eng kattasi tanlandi.",
        priority: AI_PRIORITY.low,
        entity: { type: "product", id: product.id },
        suggestedActions: [{ label: "Yangi buyurtma yaratish", to: "/purchases/orders/new" }],
      }),
    );
  });

  return results;
};

// ---------- Aggregator ----------
export const generateAIInsights = (context) => {
  const {
    orders = [],
    invoices = [],
    budgets = [],
    products = [],
    suppliers = [],
    receipts = [],
    getSupplier = (id) => suppliers.find((entry) => entry.id === id) || null,
    now = new Date(),
  } = context || {};

  const ctx = { orders, invoices, budgets, products, suppliers, receipts, getSupplier, now };

  return [
    ...buildPurchaseInsights(ctx),
    ...buildSpendingAnalysis(ctx),
    ...buildSupplierRecommendations(ctx),
    ...buildPriceRecommendations(ctx),
    ...buildBudgetRecommendations(ctx),
    ...buildPurchaseRiskDetection(ctx),
    ...buildDeliveryRisk(ctx),
    ...buildDuplicateInvoiceWarnings(ctx),
    ...buildSupplierHealth(ctx),
    ...buildCostOptimization(ctx),
    ...buildSuggestedTiming(ctx),
    ...buildSuggestedQuantity(ctx),
  ];
};

// ---------- AI Summary ----------
export const buildAISummary = (insights) => {
  const critical = insights.filter((entry) => entry.priority === AI_PRIORITY.critical).length;
  const high = insights.filter((entry) => entry.priority === AI_PRIORITY.high).length;
  const opportunities = insights.filter((entry) => entry.type === AI_INSIGHT_TYPES.opportunity).length;
  const recommendations = insights.filter((entry) => entry.type === AI_INSIGHT_TYPES.recommendation).length;

  let headline = "Joriy holat barqaror — kritik muammo aniqlanmadi.";

  if (critical > 0) {
    headline = `${critical} ta kritik masala e'tibor talab qiladi.`;
  } else if (high > 0) {
    headline = `${high} ta yuqori ustuvorlikdagi tavsiya mavjud.`;
  } else if (opportunities > 0) {
    headline = `${opportunities} ta tejash/optimallashtirish imkoniyati topildi.`;
  }

  return {
    total: insights.length,
    critical,
    high,
    opportunities,
    recommendations,
    headline,
  };
};

// ---------- Smart Alerts (kesishuvchi filtr — kritik/yuqori xavf) ----------
export const deriveSmartAlerts = (insights) =>
  insights
    .filter((entry) => entry.priority === AI_PRIORITY.critical || entry.priority === AI_PRIORITY.high)
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };

      return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
    });
