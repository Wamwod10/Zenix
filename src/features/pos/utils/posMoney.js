const DEFAULT_LOCALE = "uz-UZ";

export const normalizeMoney = (value = 0) => {
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
  const safeValue = normalizeMoney(value);

  const formattedValue = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(safeValue);

  return showCurrency ? `${formattedValue} ${currencyLabel}` : formattedValue;
};

export const calculateLineTotal = (price = 0, quantity = 0) => {
  const safePrice = normalizeMoney(price);
  const safeQuantity = normalizeMoney(quantity);

  return safePrice * safeQuantity;
};
