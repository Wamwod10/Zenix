// Xaridlar moduli lokal holati (backend ulanguncha oflayn-first saqlash).
// PDF 3: draft avtomatik saqlanadi va yo'qolmaydi.

const STORAGE_KEY = "zenix:purchases:v2";
const DRAFT_KEY = "zenix:purchases:wizard-draft:v2";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

export const loadPurchasesState = () => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const savePurchasesState = (state) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // saqlash imkoni bo'lmasa jim o'tamiz (private mode va h.k.)
  }
};

export const clearPurchasesState = () => {
  if (!isBrowser()) return;

  window.localStorage.removeItem(STORAGE_KEY);
};

// PDF 3: Draft PO — har o'zgarish avtomatik qoralamaga yoziladi
export const loadWizardDraft = () => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveWizardDraft = (draft) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore
  }
};

export const clearWizardDraft = () => {
  if (!isBrowser()) return;

  window.localStorage.removeItem(DRAFT_KEY);
};

// Point 9: "Yetkazib beruvchi standart narxini yangilash" — foydalanuvchi
// wizardda narxni tahrirlab, standart narxni yangilashni tanlasa, shu
// supplier+mahsulot juftligi uchun narx bu yerda saqlanadi. Katalog fayli
// (purchaseProducts.js) o'zgartirilmaydi — faqat Purchases moduli ichida
// "eng so'nggi kelishilgan narx" sifatida qayta ishlatiladi.
const PRICE_OVERRIDES_KEY = "zenix:purchases:supplier-price-overrides:v2";

export const loadSupplierPriceOverrides = () => {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(PRICE_OVERRIDES_KEY);

    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveSupplierPriceOverride = (supplierId, productId, price) => {
  if (!isBrowser()) return {};

  const key = `${supplierId}:${productId}`;
  const current = loadSupplierPriceOverrides();
  const next = { ...current, [key]: price };

  try {
    window.localStorage.setItem(PRICE_OVERRIDES_KEY, JSON.stringify(next));
  } catch {
    // saqlash imkoni bo'lmasa jim o'tamiz
  }

  return next;
};

export const getSupplierPriceOverride = (overrides, supplierId, productId) =>
  overrides?.[`${supplierId}:${productId}`];
