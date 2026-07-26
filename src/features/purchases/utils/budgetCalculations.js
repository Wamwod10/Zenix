// PDF 57-60 (Enterprise): Purchase Budget — davr oralig'i, mos PO larni
// topish, sarflangan/qolgan/mavjud/foiz/forecast hisoblash, holatni aniqlash.
// Bitta YAGONA dvigatel — BudgetImpactPanel (wizard, real-time) va
// BudgetProgressCard (boshqaruv ro'yxati, saqlangan holat) ikkisi ham shu
// funksiyalardan foydalanadi, mantiq ikki joyda yozilmaydi.

import {
  BUDGET_ENFORCEMENT,
  BUDGET_PERIOD_TYPES,
  BUDGET_SCOPE_TYPES,
  BUDGET_STATUSES,
  MONTH_LABELS,
  QUARTER_LABELS,
} from "../constants/budgets";
import { getDepartmentLabel } from "../constants/departments";
import { getDefaultExchangeRate } from "../constants/currencies";
import { PURCHASE_STATUSES } from "../constants/purchaseStatuses";
import { calculateOrderTotals } from "./purchaseCalculations";
import { normalizeNumber } from "./purchaseMoney";

// Davr uchun o'qiladigan yorliq — "Iyul 2026" / "III chorak 2026" / "2026 yil"
export const getBudgetPeriodLabel = (budget) => {
  if (budget.periodType === BUDGET_PERIOD_TYPES.monthly) {
    return `${MONTH_LABELS[(normalizeNumber(budget.periodMonth) || 1) - 1]} ${budget.periodYear}`;
  }

  if (budget.periodType === BUDGET_PERIOD_TYPES.quarterly) {
    return `${QUARTER_LABELS[normalizeNumber(budget.periodQuarter) || 1]} ${budget.periodYear}`;
  }

  return `${budget.periodYear}-yil`;
};

// Scope qiymatining o'qiladigan nomi — supplier/kategoriya/bo'lim/loyiha.
// `getSupplier` ixtiyoriy (Suppliers modulidan) — berilmasa supplier ID
// o'zi ko'rsatiladi.
export const getBudgetScopeLabel = (budget, { getSupplier } = {}) => {
  if (budget.scopeType === BUDGET_SCOPE_TYPES.overall) return "Barcha xaridlar";
  if (budget.scopeType === BUDGET_SCOPE_TYPES.supplier) {
    return getSupplier?.(budget.scopeValue)?.name || budget.scopeValue;
  }
  if (budget.scopeType === BUDGET_SCOPE_TYPES.department) {
    return getDepartmentLabel(budget.scopeValue);
  }

  return budget.scopeValue || "—";
};

// Byudjetga "sarf" sifatida hisoblanadigan holatlar — qoralama hali
// tasdiqlanmagan taklif, bekor qilingan esa umuman sodir bo'lmagan xarid.
const COMMITTED_STATUSES = [
  PURCHASE_STATUSES.pendingApproval,
  PURCHASE_STATUSES.approved,
  PURCHASE_STATUSES.sent,
  PURCHASE_STATUSES.partiallyReceived,
  PURCHASE_STATUSES.received,
  PURCHASE_STATUSES.invoiced,
  PURCHASE_STATUSES.paid,
];

// PDF 57: davr oralig'i — oylik/choraklik/yillik byudjetning boshlanish va
// tugash sanasi (order.createdAt shu oraliqqa tushsa — shu byudjetga tegishli).
export const getBudgetPeriodRange = (budget) => {
  const year = normalizeNumber(budget.periodYear) || new Date().getFullYear();

  if (budget.periodType === BUDGET_PERIOD_TYPES.monthly) {
    const month = Math.min(Math.max(normalizeNumber(budget.periodMonth) || 1, 1), 12);

    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0, 23, 59, 59),
    };
  }

  if (budget.periodType === BUDGET_PERIOD_TYPES.quarterly) {
    const quarter = Math.min(Math.max(normalizeNumber(budget.periodQuarter) || 1, 1), 4);
    const startMonth = (quarter - 1) * 3;

    return {
      start: new Date(year, startMonth, 1),
      end: new Date(year, startMonth + 3, 0, 23, 59, 59),
    };
  }

  // annual
  return {
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31, 23, 59, 59),
  };
};

export const isDateInBudgetPeriod = (dateValue, budget) => {
  const { start, end } = getBudgetPeriodRange(budget);
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return false;

  return date >= start && date <= end;
};

// Buyurtma qatorlarining mahsulot kategoriyasini product katalogidan topadi
// (order item o'zida kategoriya saqlamaydi — productId orqali qidiriladi).
const getItemCategory = (item, products) =>
  products.find((product) => product.id === item.productId)?.category || "";

// Byudjet scope (overall/supplier/category/department/project) shu PO ga
// tegishlimi — tekshiradi.
export const orderMatchesBudgetScope = (order, budget, { products = [] } = {}) => {
  switch (budget.scopeType) {
    case BUDGET_SCOPE_TYPES.overall:
      return true;
    case BUDGET_SCOPE_TYPES.supplier:
      return order.supplierId === budget.scopeValue;
    case BUDGET_SCOPE_TYPES.department:
      return (order.department || "") === budget.scopeValue;
    case BUDGET_SCOPE_TYPES.project:
      return (
        (order.project || "").trim().toLowerCase() ===
        (budget.scopeValue || "").trim().toLowerCase()
      );
    case BUDGET_SCOPE_TYPES.category:
      return (order.items || []).some(
        (item) => getItemCategory(item, products) === budget.scopeValue,
      );
    default:
      return false;
  }
};

// PO ning shu byudjetga tegishli QISMI — bazaviy valyutada (UZS). Kategoriya
// byudjeti uchun FAQAT shu kategoriyadagi qatorlar hisobga olinadi (aralash
// savatchada boshqa kategoriya summasi bu byudjetni "yemasin" uchun); qolgan
// barcha scope turlari uchun PO ning TO'LIQ summasi olinadi.
export const getOrderAmountForBudget = (order, budget, { products = [] } = {}) => {
  const exchangeRate = normalizeNumber(order.exchangeRate) || 1;

  if (budget.scopeType === BUDGET_SCOPE_TYPES.category) {
    const categoryItems = (order.items || []).filter(
      (item) => getItemCategory(item, products) === budget.scopeValue,
    );

    if (!categoryItems.length) return 0;

    // Landed cost va boshqa PO darajasidagi lump-sum xarajatlar kategoriya
    // kesimida taqsimlanmaydi (Enterprise cheklovi — landedCostAllocation.js
    // qator darajasida ishlaydi, kategoriya byudjeti esa faqat mahsulot
    // summasi+chegirma+soliqni hisoblaydi).
    const totals = calculateOrderTotals({
      items: categoryItems,
      taxMode: order.taxMode,
      orderDiscountPercent: order.orderDiscountPercent,
    });

    return Math.round(totals.total * exchangeRate);
  }

  if (typeof order.baseCurrencyTotal === "number") {
    return order.baseCurrencyTotal;
  }

  return Math.round(calculateOrderTotals(order).total * exchangeRate);
};

// Shu byudjetga tegishli barcha PO larni (davr + scope mos) filtrlaydi.
const findMatchingOrders = (budget, orders, { products = [] } = {}) =>
  orders.filter(
    (order) =>
      order.status !== PURCHASE_STATUSES.cancelled &&
      isDateInBudgetPeriod(order.createdAt, budget) &&
      orderMatchesBudgetScope(order, budget, { products }),
  );

// PDF 57-58: byudjet holatini to'liq hisoblaydi — Allocated/Consumed/
// Remaining/Available/Utilization%/Forecast. `excludeOrderId` — tahrirlash
// yoki wizard preview paytida shu PO ning o'zini ikki marta hisoblamaslik uchun.
export const computeBudgetConsumption = (
  budget,
  orders = [],
  { products = [], excludeOrderId = null, now = new Date() } = {},
) => {
  const matching = findMatchingOrders(budget, orders, { products }).filter(
    (order) => order.id !== excludeOrderId,
  );

  const committed = matching.filter((order) =>
    COMMITTED_STATUSES.includes(order.status),
  );
  const drafts = matching.filter(
    (order) => order.status === PURCHASE_STATUSES.draft,
  );

  // Bug fix: getOrderAmountForBudget har doim BAZAVIY valyutada (UZS)
  // qaytaradi, `budget.allocated` esa byudjetning O'ZINING valyutasida
  // (masalan USD) kiritilgan — ikkisini to'g'ridan-to'g'ri solishtirish
  // (masalan 289 mlrd UZS vs 5000 "USD" raqami) noto'g'ri natija berardi.
  // Shu sabab sarflangan summa byudjet valyutasiga qayta konvertatsiya
  // qilinadi — barcha hisob-kitob (va ko'rsatish) BIR XIL valyutada bo'ladi.
  const budgetExchangeRate = getDefaultExchangeRate(budget.currency) || 1;

  const consumed = committed.reduce(
    (sum, order) => sum + getOrderAmountForBudget(order, budget, { products }),
    0,
  ) / budgetExchangeRate;
  const reserved = drafts.reduce(
    (sum, order) => sum + getOrderAmountForBudget(order, budget, { products }),
    0,
  ) / budgetExchangeRate;

  const allocated = normalizeNumber(budget.allocated);
  const remaining = allocated - consumed;
  const available = remaining - reserved;
  const utilizationPercent = allocated > 0 ? (consumed / allocated) * 100 : 0;

  // PDF 60: Purchase Forecast — davr oxirigacha JORIY sarf tezligi asosida
  // chiziqli proyeksiya (AI emas, ochiq run-rate hisob — audit talabi:
  // "AI" deb belgilanmagan narsa haqiqiy AI bo'lib ko'rsatilmasin).
  const { start, end } = getBudgetPeriodRange(budget);
  const totalDays = Math.max((end - start) / (1000 * 60 * 60 * 24), 1);
  const elapsedDays = Math.min(
    Math.max((now - start) / (1000 * 60 * 60 * 24), 1),
    totalDays,
  );
  const forecastAmount = Math.round(consumed * (totalDays / elapsedDays));
  const forecastPercent = allocated > 0 ? (forecastAmount / allocated) * 100 : 0;

  return {
    allocated,
    consumed: Math.round(consumed),
    reserved: Math.round(reserved),
    remaining: Math.round(remaining),
    available: Math.round(available),
    utilizationPercent,
    forecastAmount,
    forecastPercent,
    matchingOrderCount: committed.length,
  };
};

// PDF 58: holatni aniqlash — 3 qat'iy bosqich (within/near/warning) + 100%da
// enforcement rejimiga qarab exceeded (soft) yoki blocked (hard).
// `thresholds` faqat OGOHLANTIRISH nuqtalarini (badge/alert) belgilaydi —
// masalan 90% yoki 95% chegara kesib o'tilgani alohida ko'rsatiladi, lekin
// yakuniy status shu 3 asosiy bosqichga yig'iladi (5 status: PDF 58 ro'yxati
// bilan bir xil — within/near/warning/exceeded/blocked).
export const resolveBudgetStatus = (utilizationPercent, enforcement = BUDGET_ENFORCEMENT.soft) => {
  if (utilizationPercent >= 100) {
    return enforcement === BUDGET_ENFORCEMENT.hard
      ? BUDGET_STATUSES.blocked
      : BUDGET_STATUSES.exceeded;
  }

  if (utilizationPercent >= 75) return BUDGET_STATUSES.warning;
  if (utilizationPercent >= 50) return BUDGET_STATUSES.nearLimit;

  return BUDGET_STATUSES.withinBudget;
};

// Sozlangan chegaralardan qaysi biri kesib o'tilgani (masalan [50,75,90] —
// UI'da "90% chegarasi oshib ketdi" kabi aniq ogohlantirish uchun).
export const getCrossedThresholds = (utilizationPercent, thresholds = []) =>
  [...thresholds]
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)
    .filter((value) => utilizationPercent >= value);

// PO Wizard uchun: bitta byudjetga nisbatan "shu xariddan KEYIN" holatni
// hisoblaydi — Current / Remaining / Budget After Purchase / Status.
export const evaluateBudgetImpact = (
  budget,
  candidateAmount,
  orders = [],
  { products = [], excludeOrderId = null, now = new Date() } = {},
) => {
  const before = computeBudgetConsumption(budget, orders, {
    products,
    excludeOrderId,
    now,
  });

  const afterConsumed = before.consumed + Math.max(normalizeNumber(candidateAmount), 0);
  const afterRemaining = before.allocated - afterConsumed;
  const afterUtilizationPercent =
    before.allocated > 0 ? (afterConsumed / before.allocated) * 100 : 0;

  const enforcement = budget.hardLimit ? BUDGET_ENFORCEMENT.hard : BUDGET_ENFORCEMENT.soft;

  return {
    ...before,
    candidateAmount: Math.max(normalizeNumber(candidateAmount), 0),
    afterConsumed: Math.round(afterConsumed),
    afterRemaining: Math.round(afterRemaining),
    afterUtilizationPercent,
    statusBefore: resolveBudgetStatus(before.utilizationPercent, enforcement),
    statusAfter: resolveBudgetStatus(afterUtilizationPercent, enforcement),
    crossedThresholds: getCrossedThresholds(afterUtilizationPercent, budget.thresholds),
    willExceed: afterUtilizationPercent >= 100,
    willBlock: budget.hardLimit && afterUtilizationPercent >= 100,
  };
};

// PO Wizard/Store uchun: shu buyurtmaga tegishli BARCHA faol byudjetlarni
// topib, har biriga nisbatan ta'sirni qaytaradi (bir nechta byudjet bir
// vaqtda tegishli bo'lishi mumkin — masalan "Umumiy yillik" + "Shu supplier
// oylik" ikkisi ham faol).
export const getApplicableBudgetImpacts = (
  order,
  budgets = [],
  orders = [],
  { products = [], excludeOrderId = null, now = new Date() } = {},
) =>
  budgets
    .filter((budget) => budget.active)
    .filter((budget) => isDateInBudgetPeriod(order.createdAt || now, budget))
    .filter((budget) => orderMatchesBudgetScope(order, budget, { products }))
    .map((budget) => ({
      budget,
      // Har bir byudjet o'z scope'iga mos summani oladi (kategoriya byudjeti —
      // faqat shu kategoriyadagi qatorlar, qolganlari — PO to'liq summasi).
      // getOrderAmountForBudget bazaviy (UZS) qaytaradi — computeBudgetConsumption
      // bilan bir xil asosda solishtirish uchun byudjet valyutasiga o'tkaziladi.
      impact: evaluateBudgetImpact(
        budget,
        getOrderAmountForBudget(order, budget, { products }) /
          (getDefaultExchangeRate(budget.currency) || 1),
        orders,
        { products, excludeOrderId, now },
      ),
    }));
