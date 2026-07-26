import { getPurchaseCurrency } from "../constants/currencies";

const DEFAULT_LOCALE = "uz-UZ";

export const normalizeNumber = (value = 0) => {
  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const numericValue = Number(normalized);

    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

export const formatMoney = (
  value = 0,
  { locale = DEFAULT_LOCALE, currencyLabel = "so'm", showCurrency = true } = {},
) => {
  const safeValue = normalizeNumber(value);

  const formattedValue = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(safeValue);

  return showCurrency ? `${formattedValue} ${currencyLabel}` : formattedValue;
};

// PDF 47: ko'p valyuta — summa PO valyutasida ko'rsatiladi
export const formatCurrencyMoney = (value = 0, currencyCode = "UZS") => {
  const currency = getPurchaseCurrency(currencyCode);
  const safeValue = normalizeNumber(value);

  const formattedValue = new Intl.NumberFormat(DEFAULT_LOCALE, {
    maximumFractionDigits: currencyCode === "UZS" ? 0 : 2,
  }).format(safeValue);

  return currencyCode === "UZS"
    ? `${formattedValue} ${currency.symbol}`
    : `${formattedValue} ${currency.code}`;
};

// Point 12: chet el valyutasidagi summalar BUTUN modulda bir xil formatda —
// "44 USD ≈ 556 600 so'm". UZS uchun faqat asosiy qiymat qaytariladi (≈ shart
// emas, chunki bazaviy valyutaning o'zi).
export const formatCurrencyWithBase = (value, currencyCode = "UZS", exchangeRate = 1) => {
  const primary = formatCurrencyMoney(value, currencyCode);

  if (!currencyCode || currencyCode === "UZS") return primary;

  const baseValue = Math.round(normalizeNumber(value) * (normalizeNumber(exchangeRate) || 1));

  return `${primary} ≈ ${formatMoney(baseValue)}`;
};

export const formatCompactMoney = (value = 0) => {
  const safeValue = normalizeNumber(value);

  if (Math.abs(safeValue) >= 1_000_000_000) {
    return `${(safeValue / 1_000_000_000).toFixed(1)} mlrd`;
  }

  if (Math.abs(safeValue) >= 1_000_000) {
    return `${(safeValue / 1_000_000).toFixed(1)} mln`;
  }

  if (Math.abs(safeValue) >= 1_000) {
    return `${Math.round(safeValue / 1_000)} ming`;
  }

  return String(Math.round(safeValue));
};

export const formatQuantity = (value = 0, unitLabel = "") => {
  const safeValue = normalizeNumber(value);
  const formatted = new Intl.NumberFormat(DEFAULT_LOCALE, {
    maximumFractionDigits: 2,
  }).format(safeValue);

  return unitLabel ? `${formatted} ${unitLabel}` : formatted;
};

// Sana formati BUTUN modulda bir xil: 22.07.2026 (uz-UZ Intl formati
// "2026 M07 22" ko'rinishini berardi — shu sabab qo'lda formatlanadi).
export const formatPurchaseDate = (value, { withTime = false } = {}) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  const pad = (num) => String(num).padStart(2, "0");
  const base = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;

  return withTime
    ? `${base} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    : base;
};
