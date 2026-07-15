const createFallbackId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

export const createPOSId = (prefix = "pos") => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return createFallbackId(prefix);
};

export const createSaleId = () => createPOSId("sale");

export const createHeldOrderId = () => createPOSId("hold");

export const createReceiptNumber = (count = 0) => {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const sequence = String(Number(count) + 1).padStart(4, "0");

  return `RCT-${datePart}-${sequence}`;
};
