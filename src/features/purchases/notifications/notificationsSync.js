// Hisoblab chiqariladigan (derived) ogohlantirishlar — foydalanuvchi
// harakatidan emas, VAQT/HOLAT o'tishidan kelib chiqadi: to'lov muddati,
// byudjet chegarasi, hujjat muddati. Har chaqiriqda JORIY holatdan qayta
// hisoblanadi va notificationsStore.reconcileDerivedNotifications orqali
// muvofiqlashtiriladi (shart yo'qolsa — bildirishnoma avtomatik arxivlanadi).

import { NOTIFICATION_TYPES } from "./notificationTypes";
import { NOTIFICATION_PRIORITIES } from "./notificationPriority";
import { getInvoiceRemaining } from "../utils/purchaseCalculations";
import { formatCurrencyMoney, formatPurchaseDate } from "../utils/purchaseMoney";
import {
  computeBudgetConsumption,
  getBudgetPeriodLabel,
  getBudgetScopeLabel,
  resolveBudgetStatus,
} from "../utils/budgetCalculations";
import { BUDGET_ENFORCEMENT, BUDGET_STATUSES } from "../constants/budgets";
import { INVOICE_STATUSES } from "../constants/paymentTerms";

const DAY_MS = 1000 * 60 * 60 * 24;
const PAYMENT_DUE_SOON_DAYS = 3;
const DOCUMENT_EXPIRING_SOON_DAYS = 30;

const diffInDays = (dateValue, now) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return null;

  return Math.floor((date - now) / DAY_MS);
};

// PDF 44-46: to'lov muddati yaqinlashgan / o'tib ketgan invoyslar.
export const buildPaymentDueMap = (invoices = [], now = new Date()) => {
  const map = new Map();

  invoices
    .filter((invoice) => invoice.status !== INVOICE_STATUSES.paid)
    .forEach((invoice) => {
      const remaining = getInvoiceRemaining(invoice);

      if (remaining <= 0 || !invoice.dueDate) return;

      const days = diffInDays(invoice.dueDate, now);

      // Faqat KELAJAKDAGI (hali o'tmagan) muddat — allaqachon o'tib ketgan
      // (days < 0) alohida buildPaymentOverdueMap orqali qayta ishlanadi,
      // ikkisi bir vaqtda bir xil invoys uchun ishlamasligi kerak.
      if (days === null || days < 0 || days > PAYMENT_DUE_SOON_DAYS) return;

      const key = `payment_due:${invoice.id}`;

      map.set(key, {
        type: NOTIFICATION_TYPES.paymentDue,
        title: "To'lov muddati yaqinlashmoqda",
        message: `${invoice.number} to'lov muddati ${formatPurchaseDate(invoice.dueDate)} — ${
          days === 0 ? "bugun" : `${days} kun qoldi`
        } (${formatCurrencyMoney(remaining, invoice.currency)}).`,
        link: "/purchases/invoices",
        refs: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          orderId: invoice.orderId,
          supplierId: invoice.supplierId,
        },
        actor: "Tizim",
        source: "derived",
        dedupeKey: key,
      });
    });

  return map;
};

export const buildPaymentOverdueMap = (invoices = [], now = new Date()) => {
  const map = new Map();

  invoices
    .filter((invoice) => invoice.status !== INVOICE_STATUSES.paid)
    .forEach((invoice) => {
      const remaining = getInvoiceRemaining(invoice);

      if (remaining <= 0 || !invoice.dueDate) return;

      const days = diffInDays(invoice.dueDate, now);

      if (days === null || days >= 0) return;

      const key = `payment_overdue:${invoice.id}`;

      map.set(key, {
        type: NOTIFICATION_TYPES.paymentOverdue,
        title: "To'lov muddati o'tib ketgan",
        message: `${invoice.number} muddati ${Math.abs(days)} kun oldin tugagan — ${formatCurrencyMoney(
          remaining,
          invoice.currency,
        )} qoldi.`,
        link: "/purchases/invoices",
        refs: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          orderId: invoice.orderId,
          supplierId: invoice.supplierId,
        },
        actor: "Tizim",
        source: "derived",
        dedupeKey: key,
      });
    });

  return map;
};

// PDF 57-60: byudjet 75%+ (warning) yoki 100%+ (exceeded/blocked) — bitta
// dvigatel (budgetCalculations.js) budget kartalari bilan bir xil.
export const buildBudgetWarningMap = (budgets = [], orders = [], products = [], now = new Date()) => {
  const map = new Map();

  budgets
    .filter((budget) => budget.active)
    .forEach((budget) => {
      const consumption = computeBudgetConsumption(budget, orders, { products, now });
      const enforcement = budget.hardLimit ? BUDGET_ENFORCEMENT.hard : BUDGET_ENFORCEMENT.soft;
      const status = resolveBudgetStatus(consumption.utilizationPercent, enforcement);

      if (status !== BUDGET_STATUSES.warning) return;

      const key = `budget_warning:${budget.id}`;

      map.set(key, {
        type: NOTIFICATION_TYPES.budgetWarning,
        title: "Byudjet ogohlantirishi",
        message: `${budget.name} (${getBudgetPeriodLabel(budget)}, ${getBudgetScopeLabel(budget)}) ${Math.round(
          consumption.utilizationPercent,
        )}% sarflandi.`,
        link: "/purchases",
        refs: { budgetId: budget.id, budgetName: budget.name },
        actor: "Tizim",
        source: "derived",
        dedupeKey: key,
      });
    });

  return map;
};

export const buildBudgetExceededMap = (budgets = [], orders = [], products = [], now = new Date()) => {
  const map = new Map();

  budgets
    .filter((budget) => budget.active)
    .forEach((budget) => {
      const consumption = computeBudgetConsumption(budget, orders, { products, now });
      const enforcement = budget.hardLimit ? BUDGET_ENFORCEMENT.hard : BUDGET_ENFORCEMENT.soft;
      const status = resolveBudgetStatus(consumption.utilizationPercent, enforcement);

      if (status !== BUDGET_STATUSES.exceeded && status !== BUDGET_STATUSES.blocked) return;

      const key = `budget_exceeded:${budget.id}`;

      map.set(key, {
        type: NOTIFICATION_TYPES.budgetExceeded,
        title: "Byudjet chegarasi oshib ketdi",
        message: `${budget.name} (${getBudgetPeriodLabel(budget)}, ${getBudgetScopeLabel(budget)}) ${Math.round(
          consumption.utilizationPercent,
        )}% ga yetdi${status === BUDGET_STATUSES.blocked ? " — yangi buyurtmalar bloklanadi (Hard Limit)" : ""}.`,
        link: "/purchases",
        refs: { budgetId: budget.id, budgetName: budget.name },
        actor: "Tizim",
        source: "derived",
        dedupeKey: key,
      });
    });

  return map;
};

// Supplier hujjatlari muddati — expiryDate maydoni bo'lgan hujjatlar uchun
// (documents[].expiryDate — ixtiyoriy, faqat foydalanuvchi kiritsa mavjud).
export const buildSupplierDocumentExpiringMap = (suppliers = [], now = new Date()) => {
  const map = new Map();

  suppliers.forEach((supplier) => {
    (supplier.documents || []).forEach((doc) => {
      if (!doc.expiryDate) return;

      const days = diffInDays(doc.expiryDate, now);

      if (days === null || days > DOCUMENT_EXPIRING_SOON_DAYS) return;

      const key = `supplier_document_expiring:${supplier.id}:${doc.id}`;

      map.set(key, {
        type: NOTIFICATION_TYPES.supplierDocumentExpiring,
        priority: days < 0 ? NOTIFICATION_PRIORITIES.critical : undefined,
        title: days < 0 ? "Hujjat muddati tugagan" : "Hujjat muddati tugamoqda",
        message: `${supplier.name} — "${doc.name}" ${
          days < 0
            ? `muddati ${Math.abs(days)} kun oldin tugagan.`
            : `muddati ${formatPurchaseDate(doc.expiryDate)} da tugaydi (${days} kun qoldi).`
        }`,
        link: `/suppliers/${supplier.id}`,
        refs: { supplierId: supplier.id },
        actor: "Tizim",
        source: "derived",
        dedupeKey: key,
      });
    });
  });

  return map;
};
