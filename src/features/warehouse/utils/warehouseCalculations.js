export const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const calculateAvailableStock = (onHand, reserved) =>
  Math.max(0, toNumber(onHand) - toNumber(reserved));

export const calculateProjectedStock = (available, incoming) =>
  toNumber(available) + toNumber(incoming);

export const calculateReorderPoint = ({
  averageDailySales = 0,
  leadTimeDays = 0,
  safetyStock = 0,
} = {}) =>
  Math.ceil(
    toNumber(averageDailySales) * toNumber(leadTimeDays) +
      toNumber(safetyStock),
  );

export const calculateInventoryValue = (quantity, cost) =>
  toNumber(quantity) * toNumber(cost);

export const calculateStockDifference = (counted, systemQuantity) =>
  toNumber(counted) - toNumber(systemQuantity);

export const calculateTransferDifference = (received, sent) =>
  toNumber(received) - toNumber(sent);

export const getStockStatus = ({ onHand = 0, reserved = 0, minimum = 0 } = {}) => {
  const available = calculateAvailableStock(onHand, reserved);

  if (toNumber(onHand) <= 0) return "out";
  if (available <= toNumber(minimum)) return "low";
  if (reserved > 0) return "reserved";
  return "healthy";
};

export const getExpiryStatus = (expiryDate, warningDays = 30) => {
  if (!expiryDate) return "none";

  const today = new Date();
  const expiry = new Date(expiryDate);
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);

  if (days < 0) return "expired";
  if (days <= 7) return "critical";
  if (days <= warningDays) return "warning";
  return "valid";
};
