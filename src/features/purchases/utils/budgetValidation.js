// PDF 57 (Enterprise): Byudjet yaratish/tahrirlash validatsiyasi — aniq xato
// xabarlari bilan. BudgetFormModal (UI, oldindan to'sadi) VA usePurchasesStore
// (store darajasida qayta tekshiradi — boshqa chaqiruvchi UI'ni chetlab
// o'tishi mumkin) shu YAGONA funksiyadan foydalanadi.

import {
  BUDGET_PERIOD_TYPES,
  BUDGET_SCOPE_TYPES,
  SCOPE_REQUIRES_VALUE,
} from "../constants/budgets";
import { PURCHASE_CURRENCIES } from "../constants/currencies";
import { normalizeNumber } from "./purchaseMoney";

const samePeriod = (a, b) => {
  if (a.periodType !== b.periodType) return false;
  if (normalizeNumber(a.periodYear) !== normalizeNumber(b.periodYear)) return false;

  if (a.periodType === BUDGET_PERIOD_TYPES.monthly) {
    return normalizeNumber(a.periodMonth) === normalizeNumber(b.periodMonth);
  }

  if (a.periodType === BUDGET_PERIOD_TYPES.quarterly) {
    return normalizeNumber(a.periodQuarter) === normalizeNumber(b.periodQuarter);
  }

  return true; // annual — yil mos bo'lsa yetarli
};

const sameScope = (a, b) =>
  a.scopeType === b.scopeType &&
  (a.scopeType === BUDGET_SCOPE_TYPES.overall ||
    (a.scopeValue || "").trim().toLowerCase() ===
      (b.scopeValue || "").trim().toLowerCase());

// Validatsiya xatolari: bo'sh massiv = xatosiz. Har bir xabar foydalanuvchiga
// to'g'ridan-to'g'ri ko'rsatiladi (BudgetFormModal).
export const validateBudgetPayload = (payload = {}, { existingBudgets = [], excludeId = null } = {}) => {
  const errors = [];

  if (!payload.name?.trim()) {
    errors.push("Byudjet nomini kiriting.");
  }

  // Manfiy/nol byudjet
  const allocated = normalizeNumber(payload.allocated);

  if (allocated <= 0) {
    errors.push("Ajratilgan byudjet 0 dan katta bo'lishi kerak (manfiy byudjet mumkin emas).");
  }

  // Scope
  if (!Object.values(BUDGET_SCOPE_TYPES).includes(payload.scopeType)) {
    errors.push("Byudjet turi tanlanmagan.");
  } else if (SCOPE_REQUIRES_VALUE[payload.scopeType] && !payload.scopeValue?.trim?.()) {
    errors.push("Bu byudjet turi uchun aniq qiymat tanlanishi/kiritilishi kerak (masalan yetkazib beruvchi yoki kategoriya).");
  }

  // Noto'g'ri davr
  if (!Object.values(BUDGET_PERIOD_TYPES).includes(payload.periodType)) {
    errors.push("Byudjet davri tanlanmagan.");
  } else {
    const year = normalizeNumber(payload.periodYear);

    if (!year || year < 2000 || year > 2100) {
      errors.push("Yil noto'g'ri — 2000-2100 oralig'ida bo'lsin.");
    }

    if (payload.periodType === BUDGET_PERIOD_TYPES.monthly) {
      const month = normalizeNumber(payload.periodMonth);

      if (!month || month < 1 || month > 12) {
        errors.push("Oylik byudjet uchun oy (1-12) tanlanishi kerak.");
      }
    }

    if (payload.periodType === BUDGET_PERIOD_TYPES.quarterly) {
      const quarter = normalizeNumber(payload.periodQuarter);

      if (!quarter || quarter < 1 || quarter > 4) {
        errors.push("Choraklik byudjet uchun chorak (1-4) tanlanishi kerak.");
      }
    }
  }

  // Valyuta mos kelmasligi
  const supportedCurrencies = PURCHASE_CURRENCIES.map((currency) => currency.code);

  if (!payload.currency || !supportedCurrencies.includes(payload.currency)) {
    errors.push("Valyuta mos emas — qo'llab-quvvatlanadigan valyutalardan birini tanlang.");
  }

  // Dublikat byudjet — bir xil scope + davr + valyuta bilan boshqa byudjet
  // allaqachon mavjud bo'lsa (faol yoki nofaol — ikkalasi ham chalkashtiradi).
  const isDuplicate = existingBudgets
    .filter((budget) => budget.id !== excludeId)
    .some(
      (budget) =>
        sameScope(budget, payload) &&
        samePeriod(budget, payload) &&
        budget.currency === payload.currency,
    );

  if (isDuplicate) {
    errors.push("Bunday scope, davr va valyutaga ega byudjet allaqachon mavjud (dublikat).");
  }

  return errors;
};

// Qattiq xato emas, lekin foydalanuvchiga ko'rsatilishi kerak bo'lgan
// ogohlantirish — masalan allocated summani sarflangandan PASTGA tushirish.
export const getBudgetPayloadWarnings = (payload = {}, { consumed = 0 } = {}) => {
  const warnings = [];
  const allocated = normalizeNumber(payload.allocated);

  if (allocated > 0 && consumed > allocated) {
    warnings.push(
      `Diqqat: yangi ajratma (${allocated.toLocaleString("uz-UZ")}) joriy sarflangan miqdordan (${consumed.toLocaleString("uz-UZ")}) kam — byudjet darhol "oshib ketgan" holatda bo'ladi.`,
    );
  }

  return warnings;
};
