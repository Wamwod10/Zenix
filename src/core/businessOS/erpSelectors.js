import { getDefaultExchangeRate } from "../../features/purchases/constants/currencies";
import { calculateMargin, calculateMarkup } from "../../features/products/utils/productCalculations";

const list = (collection = {}) =>
  Array.isArray(collection)
    ? collection
    : (collection.allIds || []).map((id) => collection.byId?.[id]).filter(Boolean);

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const isActiveSupplierProduct = (relation = {}, supplier = {}) =>
  relation.status === "active" &&
  relation.active !== false &&
  supplier.status !== "blocked" &&
  supplier.status !== "archived" &&
  supplier.blocked !== true &&
  supplier.archived !== true;

export const selectProductById = (products, productId) =>
  (Array.isArray(products) ? products.find((product) => product.id === productId) : products?.byId?.[productId]) ||
  null;

export const selectSupplierById = (suppliers, supplierId) =>
  (Array.isArray(suppliers)
    ? suppliers.find((supplier) => supplier.id === supplierId)
    : suppliers?.byId?.[supplierId]) || null;

export const selectSupplierProductsBySupplier = (suppliers, supplierId) =>
  selectSupplierById(suppliers, supplierId)?.supplierProducts || [];

export const selectSupplierProductsByProduct = (suppliers, productId) =>
  list(suppliers).flatMap((supplier) =>
    (supplier.supplierProducts || [])
      .filter((relation) => relation.productId === productId)
      .map((relation) => ({ ...relation, supplier })),
  );

export const selectProductsForSupplier = (products, supplier) => {
  const linkedIds = new Set((supplier?.supplierProducts || []).map((relation) => relation.productId));
  return list(products).filter((product) => linkedIds.has(product.id));
};

export const selectSuppliersForProduct = (suppliers, productId) =>
  selectSupplierProductsByProduct(suppliers, productId).map(({ supplier, ...relation }) => ({
    ...supplier,
    supplierProduct: relation,
  }));

export const selectPreferredSupplierForProduct = (suppliers, productId) =>
  selectSupplierProductsByProduct(suppliers, productId)
    .filter(({ supplier, ...relation }) => relation.isPreferredSupplier && isActiveSupplierProduct(relation, supplier))
    .sort((left, right) => String(right.updatedAt || "").localeCompare(String(left.updatedAt || "")))[0] || null;

export const selectSupplierPurchasePrice = (suppliers, supplierId, productId) => {
  const relation = selectSupplierProductsBySupplier(suppliers, supplierId)
    .find((entry) => entry.productId === productId);
  return relation?.purchasePrice ?? null;
};

export const selectProductPurchaseHistory = (purchaseRows = [], productId) =>
  purchaseRows.filter((row) => row.productId === productId);

export const selectSupplierPriceHistory = (suppliers, supplierProductId) =>
  list(suppliers)
    .flatMap((supplier) => supplier.supplierProducts || [])
    .find((relation) => relation.id === supplierProductId)?.priceHistory || [];

export const selectProductCurrentCost = (product) => toNumber(product?.currentCost ?? product?.cost);

export const selectProductMargin = (product, priceKey = "sellingPrice") =>
  calculateMargin(product?.[priceKey] ?? product?.price, selectProductCurrentCost(product));

export const selectProductMarkup = (product, priceKey = "sellingPrice") =>
  calculateMarkup(product?.[priceKey] ?? product?.price, selectProductCurrentCost(product));

export const selectProductStock = (product) =>
  (product?.stockSummary || []).reduce(
    (acc, row) => {
      const onHand = toNumber(row.onHand ?? row.quantity);
      const reserved = toNumber(row.reserved);
      const incoming = toNumber(row.incoming);

      acc.onHand += onHand;
      acc.reserved += reserved;
      acc.incoming += incoming;
      acc.available += Math.max(0, onHand - reserved);
      return acc;
    },
    { onHand: 0, reserved: 0, incoming: 0, available: 0 },
  );

export const buildProductSupplierComparison = ({
  product,
  suppliers = [],
  purchaseHistoryRows = [],
} = {}) => {
  if (!product?.id) return [];

  return selectSupplierProductsByProduct(suppliers, product.id)
    .map(({ supplier, ...relation }) => {
      const exchangeRate = toNumber(relation.exchangeRate || getDefaultExchangeRate(relation.currency), 1);
      const basePrice = Math.round(toNumber(relation.purchasePrice) * exchangeRate);
      const history = purchaseHistoryRows
        .filter((row) => row.productId === product.id && row.supplierId === supplier.id)
        .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));

      return {
        ...relation,
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierStatus: supplier.status,
        supplierBlocked: supplier.blocked || supplier.archived,
        convertedBasePrice: basePrice,
        exchangeRate,
        deliveryPerformance: toNumber(supplier.deliveryRate ?? supplier.onTimeRate ?? supplier.score, 0),
        purchaseCount: history.length,
        lastPurchasePrice: relation.lastPurchasePrice || history[0]?.purchasePrice || 0,
        lastPurchaseDate: relation.lastPurchaseDate || history[0]?.createdAt || "",
      };
    })
    .sort((left, right) => {
      if (left.isPreferredSupplier !== right.isPreferredSupplier) {
        return left.isPreferredSupplier ? -1 : 1;
      }
      return toNumber(left.convertedBasePrice) - toNumber(right.convertedBasePrice);
    });
};

export const buildProductSupplierSummary = ({ product, suppliers = [], purchaseHistoryRows = [] } = {}) => {
  const comparison = buildProductSupplierComparison({ product, suppliers, purchaseHistoryRows });
  const preferred = comparison.find((row) => row.isPreferredSupplier && row.status === "active") || null;

  return {
    supplierCount: comparison.filter((row) => row.status === "active").length,
    preferredSupplier: preferred,
    lastPurchasePrice: purchaseHistoryRows[0]?.purchasePrice || preferred?.lastPurchasePrice || 0,
    lastPurchaseDate: purchaseHistoryRows[0]?.createdAt || preferred?.lastPurchaseDate || "",
    comparison,
    priceHistory: comparison.flatMap((row) =>
      (row.priceHistory || []).map((entry) => ({
        ...entry,
        supplierName: row.supplierName,
        supplierProductId: row.id,
      })),
    ),
  };
};
