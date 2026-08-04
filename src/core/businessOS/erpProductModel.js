export const PRODUCT_SCHEMA_VERSION = 6;

export const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const uniqueValues = (values = []) =>
  Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );

export const resolveProductCost = (product = {}) => {
  const candidates = [
    product.currentCost,
    product.cost,
    product.costPrice,
    product.averageCost,
    product.standardCost,
    product.lastPurchaseCost,
    product.purchasePrice,
    product.lastPrice,
  ].map((value) => toNumber(value));
  const positive = candidates.find((value) => value > 0);

  return positive ?? candidates.find((value) => value >= 0) ?? 0;
};

const createHistoryId = ({ supplierId, productId, changedAt, newPrice }) =>
  `sph-${[supplierId, productId, changedAt, newPrice]
    .map((part) => String(part || "").replace(/[^a-zA-Z0-9_-]/g, ""))
    .filter(Boolean)
    .join("-")}`;

const normalizeRelationStatus = (status) =>
  ["active", "paused", "archived"].includes(status) ? status : "active";

export const normalizeProductCatalogRecord = (product = {}) => {
  const sellingPrice = toNumber(
    product.sellingPrice ??
      product.retailPrice ??
      product.price ??
      product.lastPrice ??
      0,
  );
  const currentCost = resolveProductCost(product);
  const barcode = product.barcode || product.barcodes?.[0] || "";
  const barcodes = uniqueValues([barcode, ...(product.barcodes || [])]);

  return {
    ...product,
    schemaVersion: PRODUCT_SCHEMA_VERSION,
    sellingPrice,
    retailPrice: toNumber(product.retailPrice ?? sellingPrice),
    wholesalePrice: toNumber(product.wholesalePrice ?? product.minPrice ?? 0),
    vipPrice: toNumber(product.vipPrice ?? 0),
    currentCost,
    standardCost: toNumber(product.standardCost) > 0 ? toNumber(product.standardCost) : currentCost,
    lastPurchaseCost: toNumber(product.lastPurchaseCost),
    barcode,
    barcodes,
    qrCode: product.qrCode || "",
    status: product.status || "active",
    price: sellingPrice,
    cost: currentCost,
    updatedAt: product.updatedAt || new Date().toISOString(),
  };
};

export const getSupplierProductRelationId = (supplierId, productId) =>
  `${supplierId}:${productId}`;

export const normalizeSupplierProductTerms = ({
  supplierId,
  productId,
  terms = {},
  fallback = {},
} = {}) => {
  const purchasePrice = toNumber(
    terms.purchasePrice ?? terms.price ?? fallback.purchasePrice ?? fallback.price ?? 0,
  );
  const currency = terms.currency || fallback.currency || "UZS";
  const now = new Date().toISOString();
  const status = normalizeRelationStatus(terms.status);
  const discountType = ["percentage", "fixed"].includes(terms.discountType)
    ? terms.discountType
    : terms.fixedDiscount !== undefined
      ? "fixed"
      : "percentage";
  const discountValue = toNumber(
    terms.discountValue ?? terms.discount ?? terms.fixedDiscount ?? 0,
  );
  const vatRate = toNumber(terms.vatRate ?? terms.vat ?? terms.taxRate);
  const priceHistory = Array.isArray(terms.priceHistory)
    ? terms.priceHistory
    : purchasePrice > 0
      ? [
          {
            id: createHistoryId({
              supplierId,
              productId,
              changedAt: terms.updatedAt || terms.createdAt || now,
              newPrice: purchasePrice,
            }),
        purchasePrice,
        oldPrice: 0,
        newPrice: purchasePrice,
        currency,
        changedBy: "system",
        changedAt: terms.updatedAt || terms.createdAt || now,
        reason: terms.reason || "",
        source: terms.source || "migration",
      },
        ]
      : [];

  return {
    id: terms.id || getSupplierProductRelationId(supplierId, productId),
    supplierId,
    productId,
    supplierSku: terms.supplierSku ?? terms.sku ?? "",
    supplierBarcode: terms.supplierBarcode ?? "",
    purchasePrice,
    currency,
    discountType,
    discountValue,
    discount: discountType === "percentage" ? discountValue : 0,
    fixedDiscount: discountType === "fixed" ? discountValue : 0,
    taxId: terms.taxId || fallback.taxId || "",
    vatRate,
    vat: vatRate,
    taxInclusive: Boolean(terms.taxInclusive),
    exchangeRate: toNumber(terms.exchangeRate || fallback.exchangeRate || 1, 1),
    leadTime:
      terms.leadTime !== undefined
        ? Math.max(toNumber(terms.leadTime), 0)
        : terms.leadTimeDays !== undefined
          ? Math.max(toNumber(terms.leadTimeDays), 0)
          : fallback.leadTimeDays !== undefined
            ? Math.max(toNumber(fallback.leadTimeDays), 0)
            : undefined,
    minimumOrderQty: Math.max(toNumber(terms.minimumOrderQty ?? terms.moq ?? fallback.moq, 1), 1),
    lastPurchasePrice: toNumber(terms.lastPurchasePrice),
    lastPurchaseDate: terms.lastPurchaseDate || "",
    isPreferredSupplier: status === "active" && Boolean(terms.isPreferredSupplier),
    status,
    notes: terms.notes || "",
    paymentTerm: terms.paymentTerm || fallback.paymentTerm || "",
    taxMode: terms.taxMode || fallback.taxMode || "",
    active: terms.active !== false,
    createdAt: terms.createdAt || now,
    updatedAt: terms.updatedAt || now,
    priceHistory,
  };
};

export const normalizeSupplierProductRelations = (supplier = {}) => {
  const productIds = uniqueValues(supplier.productIds || []);
  const overrides = supplier.productOverrides || {};
  const supplierProducts = Array.isArray(supplier.supplierProducts)
    ? supplier.supplierProducts
    : [];

  const map = {};

  supplierProducts.forEach((relation) => {
    if (!relation?.productId) return;
    map[relation.productId] = normalizeSupplierProductTerms({
      supplierId: supplier.id,
      productId: relation.productId,
      terms: relation,
      fallback: supplier,
    });
  });

  productIds.forEach((productId) => {
    map[productId] = normalizeSupplierProductTerms({
      supplierId: supplier.id,
      productId,
      terms: { ...(map[productId] || {}), ...(overrides[productId] || {}) },
      fallback: supplier,
    });
  });

  const relations = Object.values(map);

  return {
    productIds: uniqueValues([
      ...productIds,
      ...relations.map((relation) => relation.productId),
    ]),
    supplierProducts: relations,
    productOverrides: relations.reduce((next, relation) => {
      next[relation.productId] = {
        supplierSku: relation.supplierSku,
        sku: relation.supplierSku,
        supplierBarcode: relation.supplierBarcode,
        purchasePrice: relation.purchasePrice,
        price: relation.purchasePrice,
        currency: relation.currency,
        discount: relation.discount,
        discountType: relation.discountType,
        discountValue: relation.discountValue,
        fixedDiscount: relation.fixedDiscount,
        taxId: relation.taxId,
        vatRate: relation.vatRate,
        vat: relation.vat,
        taxInclusive: relation.taxInclusive,
        exchangeRate: relation.exchangeRate,
        leadTime: relation.leadTime,
        leadTimeDays: relation.leadTime,
        minimumOrderQty: relation.minimumOrderQty,
        moq: relation.minimumOrderQty,
        lastPurchasePrice: relation.lastPurchasePrice,
        lastPurchaseDate: relation.lastPurchaseDate,
        isPreferredSupplier: relation.isPreferredSupplier,
        status: relation.status,
        notes: relation.notes,
        priceHistory: relation.priceHistory,
        updatedAt: relation.updatedAt,
      };
      return next;
    }, {}),
  };
};

export const upsertSupplierProductRelation = (supplier = {}, productId, terms = {}) => {
  const normalized = normalizeSupplierProductRelations(supplier);
  const existing = normalized.supplierProducts.find((entry) => entry.productId === productId);
  const relation = normalizeSupplierProductTerms({
    supplierId: supplier.id,
    productId,
    terms: {
      ...(existing || {}),
      ...terms,
      priceHistory: existing?.priceHistory,
    },
    fallback: supplier,
  });
  const priceChanged =
    existing &&
    relation.purchasePrice > 0 &&
    toNumber(existing.purchasePrice) !== relation.purchasePrice;

  if (priceChanged) {
    relation.priceHistory = [
      {
        id: createHistoryId({
          supplierId: supplier.id,
          productId,
          changedAt: relation.updatedAt,
          newPrice: relation.purchasePrice,
        }),
        supplierProductId: relation.id,
        supplierId: supplier.id,
        productId,
        oldPrice: toNumber(existing.purchasePrice),
        newPrice: relation.purchasePrice,
        purchasePrice: relation.purchasePrice,
        currency: relation.currency,
        changedBy: terms.changedBy || "system",
        changedAt: relation.updatedAt,
        reason: terms.reason || "",
        source: terms.source || "manual",
      },
      ...(existing.priceHistory || []),
    ];
  }

  return normalizeSupplierProductRelations({
    ...supplier,
    productIds: uniqueValues([...normalized.productIds, productId]),
    supplierProducts: [
      relation,
      ...normalized.supplierProducts.filter((entry) => entry.productId !== productId),
    ],
  });
};

export const enforceSinglePreferredSupplier = (suppliers = [], productId, preferredSupplierId) =>
  suppliers.map((supplier) => {
    const relationState = normalizeSupplierProductRelations(supplier);
    const supplierIsEligible =
      supplier.id === preferredSupplierId &&
      supplier.status !== "blocked" &&
      supplier.status !== "archived" &&
      supplier.blocked !== true &&
      supplier.archived !== true;

    const supplierProducts = relationState.supplierProducts.map((relation) => {
      if (relation.productId !== productId) return relation;
      return {
        ...relation,
        isPreferredSupplier:
          supplierIsEligible && relation.status === "active" && relation.active !== false,
      };
    });

    return {
      ...supplier,
      ...normalizeSupplierProductRelations({
        ...supplier,
        supplierProducts,
      }),
    };
  });

export const calculateWeightedAverageCost = ({
  previousQuantity = 0,
  previousCost = 0,
  receivedQuantity = 0,
  unitCost = 0,
} = {}) => {
  const beforeQty = Math.max(toNumber(previousQuantity), 0);
  const incomingQty = Math.max(toNumber(receivedQuantity), 0);
  const totalQty = beforeQty + incomingQty;

  if (incomingQty <= 0) return toNumber(previousCost);
  if (toNumber(previousCost) <= 0 && toNumber(unitCost) > 0) {
    return toNumber(unitCost);
  }
  if (totalQty <= 0) return toNumber(unitCost);

  return Math.round(
    ((beforeQty * toNumber(previousCost) + incomingQty * toNumber(unitCost)) /
      totalQty) *
      100,
  ) / 100;
};
