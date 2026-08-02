const currencyMinorDigits = {
  UZS: 0,
  USD: 2,
  EUR: 2,
  RUB: 2,
};

export const getMinorDigits = (currency = "UZS") =>
  currencyMinorDigits[currency] ?? 2;

export const toMinorUnit = (value = 0, currency = "UZS") => {
  const amount = Number(value || 0);
  const multiplier = 10 ** getMinorDigits(currency);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round(amount * multiplier);
};

export const fromMinorUnit = (minorValue = 0, currency = "UZS") => {
  const multiplier = 10 ** getMinorDigits(currency);
  const amount = Number(minorValue || 0);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return amount / multiplier;
};

export const normalizeMoneyInput = (value = 0) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
};

export const isPositiveMoney = (value = 0) => normalizeMoneyInput(value) > 0;

export const hasEnoughBalance = ({ balance = 0, amount = 0, currency = "UZS" } = {}) =>
  toMinorUnit(balance, currency) >= toMinorUnit(amount, currency);

export const addMoney = (left = 0, right = 0, currency = "UZS") =>
  fromMinorUnit(toMinorUnit(left, currency) + toMinorUnit(right, currency), currency);

export const subtractMoney = (left = 0, right = 0, currency = "UZS") =>
  fromMinorUnit(toMinorUnit(left, currency) - toMinorUnit(right, currency), currency);
