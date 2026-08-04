import { BASE_BUSINESS_CURRENCY, convertMoneyToBase } from "../../finance/utils/financeMoney";

// Mock currency catalog. Backend later can replace exchangeRate values.
export const BASE_PURCHASE_CURRENCY = BASE_BUSINESS_CURRENCY;

export const PURCHASE_CURRENCIES = [
  { code: "UZS", label: "UZS", symbol: "so'm", exchangeRate: 1 },
  { code: "USD", label: "USD", symbol: "$", exchangeRate: 12_650 },
  { code: "EUR", label: "EUR", symbol: "EUR", exchangeRate: 13_780 },
  { code: "RUB", label: "RUB", symbol: "RUB", exchangeRate: 142 },
];

export const getPurchaseCurrency = (code = BASE_PURCHASE_CURRENCY) =>
  PURCHASE_CURRENCIES.find((currency) => currency.code === code) ||
  PURCHASE_CURRENCIES[0];

export const getDefaultExchangeRate = (code = BASE_PURCHASE_CURRENCY) =>
  getPurchaseCurrency(code).exchangeRate;

export const convertToBaseCurrency = (amount = 0, exchangeRate = 1) =>
  convertMoneyToBase(amount, exchangeRate);
