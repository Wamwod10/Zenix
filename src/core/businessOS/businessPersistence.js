export const BUSINESS_SCHEMA_VERSION = 1;

export const businessStorageKeys = {
  entities: "zenix:v1:entities",
  settings: "zenix:v1:settings",
  audit: "zenix:v1:audit",
};

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

const readJson = (key, fallback) => {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  if (!canUseStorage()) return { ok: false, error: "storage_unavailable" };

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    return { ok: false, error: "storage_unavailable" };
  }
};

export const createEmptyEntity = () => ({ byId: {}, allIds: [] });

export const upsertMany = (entity, rows = []) => {
  rows.filter(Boolean).forEach((row) => {
    if (!row.id) return;
    const id = String(row.id);
    entity.byId[id] = { ...(entity.byId[id] || {}), ...row, id };
    if (!entity.allIds.includes(id)) entity.allIds.push(id);
  });
};

const collectionFrom = (rows = []) => {
  const entity = createEmptyEntity();
  upsertMany(entity, rows);
  return entity;
};

const legacyProducts = readJson("zenix.products.state.v2", {});
const legacyWarehouse = readJson("zenix.warehouse.state.v2", {});
const legacyCrmCustomers = readJson("zenix.crm.customers.v2", []);
const legacySuppliers = readJson("zenix:suppliers:v2", {});
const legacyPurchases = readJson("zenix:purchases:v2", {});
const legacyFinance = readJson("zenix.finance.state.v3", {});
const legacyHr = readJson("zenix.hr.state.v2", {});
const legacySettings = readJson("zenix.settings.state.v2", {});

const seedBranches = [
  {
    id: "branch-main",
    code: "BR-001",
    name: "Asosiy filial",
    status: "active",
    currency: "UZS",
  },
];

const seedWarehouses = [
  {
    id: "wh-main",
    code: "WH-001",
    name: "Asosiy ombor",
    branchId: "branch-main",
    branch: "Asosiy filial",
    status: "active",
    capacity: 10000,
  },
];

const seedAccounts = [
  { id: "1000", code: "1000", name: "Kassa", kind: "cash", type: "asset", currency: "UZS", openingBalance: 0, active: true },
  { id: "1010", code: "1010", name: "Bank hisob raqami", kind: "bank", type: "asset", currency: "UZS", openingBalance: 0, active: true },
  { id: "4000", code: "4000", name: "Savdo daromadi", kind: "revenue", type: "income", currency: "UZS", openingBalance: 0, active: true },
  { id: "2000", code: "2000", name: "Kreditor qarz", kind: "payable", type: "liability", currency: "UZS", openingBalance: 0, active: true },
];

const defaultSettings = {
  schemaVersion: BUSINESS_SCHEMA_VERSION,
  baseCurrency: legacySettings.finance?.baseCurrency || "UZS",
  dateFormat: legacySettings.localization?.dateFormat || "DD.MM.YYYY",
  taxRate: 0,
  defaultBranchId: legacySettings.business?.defaultBranch || "branch-main",
  defaultWarehouseId: "wh-main",
  paymentMethods: legacySettings.payments || [
    { id: "cash", label: "Naqd", accountId: "1000", enabled: true },
    { id: "card", label: "Karta", accountId: "1010", enabled: true },
    { id: "digital", label: "Elektron", accountId: "1010", enabled: true },
    { id: "debt", label: "Qarz", accountId: "1100", enabled: true },
  ],
  permissions: legacySettings.permissions || {},
  notificationSettings: legacySettings.notifications || {},
};

const buildStockBalances = (products = []) => {
  const balances = [];

  products.forEach((product) => {
    (product.stockSummary || []).forEach((row) => {
      if (!row.warehouseId) return;
      balances.push({
        id: `${product.id}:${row.warehouseId}`,
        productId: product.id,
        warehouseId: row.warehouseId,
        onHand: Number(row.onHand ?? row.quantity ?? 0),
        reserved: Number(row.reserved || 0),
        incoming: Number(row.incoming || 0),
        location: row.location || "",
        updatedAt: product.updatedAt || new Date().toISOString(),
      });
    });

    Object.entries(product.stocks || {}).forEach(([warehouseId, stock]) => {
      balances.push({
        id: `${product.id}:${warehouseId}`,
        productId: product.id,
        warehouseId,
        onHand: Number(stock.onHand || 0),
        reserved: Number(stock.reserved || 0),
        incoming: Number(stock.incoming || 0),
        location: stock.location || "",
        updatedAt: product.updatedAt || new Date().toISOString(),
      });
    });
  });

  return balances;
};

const normalizeProducts = (products = []) =>
  products.map((product) => ({
    ...product,
    id: String(product.id),
    categoryId: product.categoryId || product.category?.id || product.category || "",
    brandId: product.brandId || product.brand?.id || product.brand || "",
    status: product.status || "active",
    price: Number(product.price ?? product.lastPrice ?? 0),
    cost: Number(product.cost || 0),
    barcode: product.barcode || product.barcodes?.[0] || "",
    barcodes: product.barcodes || [product.barcode].filter(Boolean),
  }));

const normalizeCustomers = (customers = []) =>
  customers.map((customer) => ({
    ...customer,
    id: String(customer.id),
    name: customer.name || customer.fullName || customer.company || "Mijoz",
    fullName: customer.fullName || customer.name || customer.company || "Mijoz",
    status: customer.status || "active",
    archived: Boolean(customer.archived),
    orderCount: Number(customer.orderCount || 0),
    totalSpent: Number(customer.totalSpent || 0),
    averageCheck: Number(customer.averageCheck || 0),
    bonus: Number(customer.bonus || customer.loyaltyBonus || 0),
  }));

export const createInitialBusinessState = () => {
  const productRows = normalizeProducts([
    ...(legacyProducts.products || []),
    ...(legacyWarehouse.products || []),
    ...(legacyPurchases.products || []),
  ]);
  const warehouseRows = [
    ...seedWarehouses,
    ...(legacySettings.warehouses || []),
    ...(legacyWarehouse.warehouses || []),
  ];
  const branchRows = [
    ...seedBranches,
    ...(legacySettings.branches || []),
    ...(legacyHr.branches || []),
  ];

  return {
    entities: {
      products: collectionFrom(productRows),
      categories: collectionFrom(legacyProducts.categories || []),
      brands: collectionFrom(legacyProducts.brands || []),
      warehouses: collectionFrom(warehouseRows),
      stockBalances: collectionFrom(buildStockBalances(productRows)),
      stockMovements: collectionFrom(legacyWarehouse.movements || []),
      customers: collectionFrom(normalizeCustomers(legacyCrmCustomers)),
      customerActivities: createEmptyEntity(),
      suppliers: collectionFrom(legacySuppliers.suppliers || []),
      purchaseOrders: collectionFrom(legacyPurchases.orders || []),
      purchaseReceipts: collectionFrom(legacyPurchases.receipts || []),
      purchaseInvoices: collectionFrom(legacyPurchases.invoices || []),
      sales: createEmptyEntity(),
      saleItems: createEmptyEntity(),
      returns: collectionFrom([...(legacyPurchases.returns || [])]),
      transactions: collectionFrom(legacyFinance.transactions || []),
      accounts: collectionFrom([...(legacyFinance.accounts || []), ...seedAccounts]),
      employees: collectionFrom(legacyHr.employees || []),
      branches: collectionFrom(branchRows),
      users: collectionFrom(legacySettings.users || []),
      shifts: collectionFrom(legacyHr.shifts || []),
      payments: createEmptyEntity(),
      notifications: createEmptyEntity(),
      auditEvents: createEmptyEntity(),
    },
    settings: defaultSettings,
    meta: {
      schemaVersion: BUSINESS_SCHEMA_VERSION,
      migratedLegacyKeys: [
        "zenix.products.state.v2",
        "zenix.warehouse.state.v2",
        "zenix.crm.customers.v2",
        "zenix:suppliers:v2",
        "zenix:purchases:v2",
        "zenix.finance.state.v3",
        "zenix.hr.state.v2",
        "zenix.settings.state.v2",
      ],
      lastHydratedAt: new Date().toISOString(),
    },
  };
};

export const loadBusinessState = () => {
  const entities = readJson(businessStorageKeys.entities, null);
  const settings = readJson(businessStorageKeys.settings, null);
  const audit = readJson(businessStorageKeys.audit, null);
  const initial = createInitialBusinessState();

  if (!entities && !settings && !audit) return initial;

  return {
    ...initial,
    entities: {
      ...initial.entities,
      ...(entities?.value || entities || {}),
      auditEvents: audit?.value || audit || initial.entities.auditEvents,
    },
    settings: {
      ...initial.settings,
      ...(settings?.value || settings || {}),
    },
    meta: {
      ...initial.meta,
      lastHydratedAt: new Date().toISOString(),
    },
  };
};

export const saveBusinessState = (state) => {
  writeJson(businessStorageKeys.entities, {
    schemaVersion: BUSINESS_SCHEMA_VERSION,
    value: state.entities,
  });
  writeJson(businessStorageKeys.settings, {
    schemaVersion: BUSINESS_SCHEMA_VERSION,
    value: state.settings,
  });
  writeJson(businessStorageKeys.audit, {
    schemaVersion: BUSINESS_SCHEMA_VERSION,
    value: state.entities.auditEvents,
  });
};

export const resetBusinessPersistence = () => {
  if (!canUseStorage()) return;
  Object.values(businessStorageKeys).forEach((key) => window.localStorage.removeItem(key));
};
