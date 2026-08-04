import { calculateLineSubtotal } from "./purchaseCalculations";
import { normalizeNumber } from "./purchaseMoney";

export const buildPurchaseItemSnapshot = ({
  order,
  item,
  receipt = null,
  supplierProduct = null,
} = {}) => {
  const quantity = normalizeNumber(receipt?.received ?? item?.quantity);
  const purchasePrice = normalizeNumber(item?.purchasePrice ?? item?.price);
  const discount = normalizeNumber(item?.discount ?? item?.discountPercent);
  const discountType = item?.discountType || "percentage";
  const discountValue = normalizeNumber(item?.discountValue ?? discount);
  const vat = normalizeNumber(item?.vatRate ?? item?.vat ?? item?.taxRate);
  const currency = item?.currency || order?.currency || supplierProduct?.currency || "UZS";
  const exchangeRate = normalizeNumber(item?.exchangeRate ?? order?.exchangeRate ?? 1) || 1;
  const subtotal = calculateLineSubtotal({
    quantity,
    price: purchasePrice,
    discountType,
    discountValue,
    discountPercent: discount,
  });
  const taxInclusive = Boolean(item?.taxInclusive);
  const taxAmount = taxInclusive
    ? Math.round(subtotal - subtotal / (1 + vat / 100))
    : Math.round((subtotal * vat) / 100);
  const total = taxInclusive ? Math.round(subtotal) : Math.round(subtotal + taxAmount);

  return {
    id: item?.purchaseItemId || item?.id,
    purchaseOrderId: order?.id || item?.purchaseOrderId || "",
    purchaseReceiptId: receipt?.id || receipt?.receiptId || "",
    productId: item?.productId || "",
    supplierId: order?.supplierId || item?.supplierId || "",
    supplierProductId: item?.supplierProductId || supplierProduct?.id || "",
    purchasePrice,
    quantity,
    discountType,
    discountValue,
    discount,
    taxId: item?.taxId || "",
    vatRate: vat,
    vat,
    taxInclusive,
    currency,
    exchangeRate,
    baseCurrencyAmount: normalizeNumber(item?.baseCurrencyAmount) || Math.round(total * exchangeRate),
    subtotal: Math.round(subtotal),
    taxAmount,
    total,
    createdAt: receipt?.receivedAt || order?.createdAt || item?.createdAt || new Date().toISOString(),
    warehouseId: receipt?.warehouseId || order?.warehouseId || "",
    responsibleEmployee: receipt?.receivedBy || order?.buyer?.name || order?.createdBy || "",
  };
};

export const buildPurchaseHistoryRows = ({
  orders = [],
  receipts = [],
  suppliers = [],
  products = [],
} = {}) => {
  const suppliersById = Object.fromEntries(suppliers.map((supplier) => [supplier.id, supplier]));
  const productsById = Object.fromEntries(products.map((product) => [product.id, product]));
  const receiptItems = receipts.flatMap((receipt) =>
    (receipt.items || []).map((line) => ({
      receipt,
      itemId: line.itemId,
      received: line.received,
    })),
  );

  return orders.flatMap((order) =>
    (order.items || []).flatMap((item) => {
      const matches = receiptItems.filter(
        (entry) => entry.receipt.orderId === order.id && entry.itemId === item.id,
      );
      const rows = matches.length ? matches : [{ receipt: null, received: item.quantity }];

      return rows.map(({ receipt, received }) => {
        const snapshot = buildPurchaseItemSnapshot({
          order,
          item,
          receipt: receipt
            ? {
                ...receipt,
                id: receipt.id,
                receivedAt: receipt.receivedAt,
                receivedBy: receipt.receivedBy,
                received,
              }
            : { received },
        });

        return {
          ...snapshot,
          purchaseOrderNumber: order.number,
          purchaseReceiptNumber: receipt?.number || "",
          supplierName: suppliersById[snapshot.supplierId]?.name || snapshot.supplierId,
          productName: productsById[snapshot.productId]?.name || item.name || snapshot.productId,
        };
      });
    }),
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
