import { calculateLineTotal, normalizeMoney } from "./posMoney";

export const normalizeAmount = normalizeMoney;

export const calculateSubtotal = (items = []) =>
  items.reduce(
    (total, item) =>
      total + calculateLineTotal(item.price, Math.max(normalizeAmount(item.quantity), 0)),
    0,
  );

export const calculateDiscountAmount = ({
  subtotal = 0,
  discount = null,
} = {}) => {
  const safeSubtotal = Math.max(normalizeAmount(subtotal), 0);
  const discountType = discount?.type || "fixed";
  const discountValue = normalizeAmount(discount?.value ?? discount ?? 0);

  if (discountValue <= 0 || safeSubtotal <= 0) {
    return 0;
  }

  const amount =
    discountType === "percentage"
      ? Math.round((safeSubtotal * Math.min(discountValue, 100)) / 100)
      : discountValue;

  return Math.min(Math.max(amount, 0), safeSubtotal);
};

export const calculateItemDiscountAmount = (item) => {
  const lineSubtotal = calculateLineTotal(item.price, item.quantity);

  return calculateDiscountAmount({
    subtotal: lineSubtotal,
    discount: item.discount,
  });
};

export const calculateItemsDiscount = (items = []) =>
  items.reduce(
    (total, item) => total + calculateItemDiscountAmount(item),
    0,
  );

export const calculateOrderTotals = ({
  items = [],
  discount = null,
  taxRate = 0,
  serviceFee = 0,
  bonus = 0,
} = {}) => {
  const subtotal = calculateSubtotal(items);
  const itemDiscount = calculateItemsDiscount(items);
  const orderDiscount = calculateDiscountAmount({
    subtotal: Math.max(subtotal - itemDiscount, 0),
    discount,
  });
  const discountAmount = itemDiscount + orderDiscount;
  const safeBonus = Math.min(Math.max(normalizeAmount(bonus), 0), subtotal - discountAmount);
  const safeServiceFee = Math.max(normalizeAmount(serviceFee), 0);
  const taxableAmount = Math.max(subtotal - discountAmount - safeBonus, 0);
  const safeTaxRate = Math.max(normalizeAmount(taxRate), 0);
  const tax = Math.round(taxableAmount * safeTaxRate);

  return {
    subtotal,
    discount: discountAmount,
    itemDiscount,
    orderDiscount,
    bonus: safeBonus,
    serviceFee: safeServiceFee,
    tax,
    total: taxableAmount + tax + safeServiceFee,
  };
};

export const calculateDiscountedTotal = ({
  subtotal = 0,
  discount = 0,
  taxRate = 0,
} = {}) => {
  const safeSubtotal = Math.max(normalizeAmount(subtotal), 0);
  const safeDiscount = calculateDiscountAmount({ subtotal: safeSubtotal, discount });
  const taxableAmount = safeSubtotal - safeDiscount;
  const safeTaxRate = Math.max(normalizeAmount(taxRate), 0);
  const tax = Math.round(taxableAmount * safeTaxRate);

  return {
    subtotal: safeSubtotal,
    discount: safeDiscount,
    tax,
    total: taxableAmount + tax,
  };
};

export const validateSplitPayment = (values = {}, total = 0) => {
  const paidAmount = Object.values(values).reduce(
    (sum, value) => sum + Math.max(normalizeAmount(value), 0),
    0,
  );
  const safeTotal = Math.max(normalizeAmount(total), 0);

  return {
    paidAmount,
    remaining: Math.max(safeTotal - paidAmount, 0),
    overpaid: Math.max(paidAmount - safeTotal, 0),
    isValid: safeTotal > 0 && paidAmount >= safeTotal,
  };
};
