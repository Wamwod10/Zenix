import { BASE_PURCHASE_CURRENCY, convertToBaseCurrency } from "../../purchases/constants/currencies";
import { normalizeNumber } from "../../purchases/utils/purchaseMoney";

export const INVENTORY_COST_METHODS = {
  fifo: "fifo",
  lifo: "lifo",
  weightedAverage: "weighted_average",
  lastPurchasePrice: "last_purchase_price",
  standardCost: "standard_cost",
};

export const DEFAULT_INVENTORY_COST_METHOD = INVENTORY_COST_METHODS.weightedAverage;

export const createInventoryLayer = ({
  productId,
  warehouseId,
  receiptId,
  receiptItemId,
  quantity,
  unitCost,
  currency = BASE_PURCHASE_CURRENCY,
  receivedAt,
}) => ({
  id: `${receiptId}:${receiptItemId || productId}`,
  productId,
  warehouseId,
  receiptId,
  receiptItemId,
  quantity: normalizeNumber(quantity),
  remainingQuantity: normalizeNumber(quantity),
  unitCost: normalizeNumber(unitCost),
  currency,
  receivedAt,
  status: "open",
});

export const calculateWeightedAverageCost = ({
  currentStock = 0,
  currentCost = 0,
  newQty = 0,
  newPrice = 0,
} = {}) => {
  const previousQty = Math.max(normalizeNumber(currentStock), 0);
  const incomingQty = Math.max(normalizeNumber(newQty), 0);
  const totalQty = previousQty + incomingQty;

  if (incomingQty <= 0) return normalizeNumber(currentCost);
  if (normalizeNumber(currentCost) <= 0 && normalizeNumber(newPrice) > 0) {
    return normalizeNumber(newPrice);
  }
  if (totalQty <= 0) return normalizeNumber(newPrice);

  return Math.round(
    ((previousQty * normalizeNumber(currentCost) + incomingQty * normalizeNumber(newPrice)) /
      totalQty) *
      100,
  ) / 100;
};

export const resolveReceiptUnitCost = ({
  purchasePrice = 0,
  discountType = "percentage",
  discount = 0,
  discountValue,
  vat = 0,
  taxInclusive = false,
  landedUnitCost = 0,
  exchangeRate = 1,
  includeVatInCost = false,
  includeDiscountInCost = true,
} = {}) => {
  const price = normalizeNumber(purchasePrice);
  const normalizedDiscount = normalizeNumber(discountValue ?? discount);
  const discountAmount =
    includeDiscountInCost && discountType === "fixed"
      ? normalizedDiscount
      : includeDiscountInCost
        ? (price * normalizedDiscount) / 100
        : 0;
  const discountedPrice = Math.max(0, price - discountAmount);
  const vatRate = normalizeNumber(vat);
  const vatAmount =
    includeVatInCost && taxInclusive
      ? discountedPrice - discountedPrice / (1 + vatRate / 100)
      : includeVatInCost
        ? (discountedPrice * vatRate) / 100
        : 0;
  const netPriceBeforeLanded =
    taxInclusive && !includeVatInCost
      ? discountedPrice / (1 + vatRate / 100)
      : taxInclusive
        ? discountedPrice
        : discountedPrice + vatAmount;
  const netPrice = netPriceBeforeLanded + normalizeNumber(landedUnitCost);

  return convertToBaseCurrency(netPrice, normalizeNumber(exchangeRate) || 1);
};

export const calculateReceiptCost = ({
  method = DEFAULT_INVENTORY_COST_METHOD,
  currentStock,
  currentCost,
  standardCost,
  purchasePrice,
  newQty,
} = {}) => {
  if (method === INVENTORY_COST_METHODS.standardCost) {
    return normalizeNumber(standardCost);
  }

  if (method === INVENTORY_COST_METHODS.lastPurchasePrice) {
    return normalizeNumber(purchasePrice);
  }

  if (method === INVENTORY_COST_METHODS.fifo || method === INVENTORY_COST_METHODS.lifo) {
    return normalizeNumber(currentCost || purchasePrice);
  }

  return calculateWeightedAverageCost({
    currentStock,
    currentCost,
    newQty,
    newPrice: purchasePrice,
  });
};
