import { createSlice } from "@reduxjs/toolkit";

import { createEmptyEntity, loadBusinessState, upsertMany } from "./businessPersistence.js";

const now = () => new Date().toISOString();

const createBusinessId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const list = (entity = createEmptyEntity()) =>
  (entity.allIds || []).map((id) => entity.byId[id]).filter(Boolean);

const upsertOne = (entity, row) => upsertMany(entity, [row]);

const resolveName = (entity, id, fallback = "") => entity.byId?.[id]?.name || fallback || id || "";

const getBalanceId = (productId, warehouseId) => `${productId}:${warehouseId}`;

const readAvailable = (state, productId, warehouseId = state.settings.defaultWarehouseId) => {
  const balance = state.entities.stockBalances.byId[getBalanceId(productId, warehouseId)];
  return Math.max(0, toNumber(balance?.onHand) - toNumber(balance?.reserved));
};

const addAudit = (state, event) => {
  const audit = {
    id: createBusinessId("audit"),
    at: now(),
    userId: event.userId || "system",
    module: event.module || "core",
    entity: event.entity || "",
    entityId: event.entityId || "",
    action: event.action,
    oldValue: event.oldValue ?? null,
    newValue: event.newValue ?? null,
    source: event.source || "frontend",
    result: event.result || "success",
  };

  upsertOne(state.entities.auditEvents, audit);
  state.entities.auditEvents.allIds = [audit.id, ...state.entities.auditEvents.allIds.filter((id) => id !== audit.id)].slice(0, 300);
};

const addNotification = (state, notification) => {
  const entry = {
    id: createBusinessId("notice"),
    createdAt: now(),
    read: false,
    level: "normal",
    ...notification,
  };

  upsertOne(state.entities.notifications, entry);
  state.entities.notifications.allIds = [entry.id, ...state.entities.notifications.allIds.filter((id) => id !== entry.id)].slice(0, 120);
};

const normalizeProduct = (product = {}, state) => {
  const categoryId = product.categoryId || product.category?.id || product.category || "";
  const brandId = product.brandId || product.brand?.id || product.brand || "";

  return {
    ...product,
    id: String(product.id || createBusinessId("prd")),
    categoryId,
    brandId,
    categoryName: product.categoryName || resolveName(state.entities.categories, categoryId, product.category?.name || product.category),
    brandName: product.brandName || resolveName(state.entities.brands, brandId, product.brand?.name || product.brand),
    status: product.status || "active",
    barcode: product.barcode || product.barcodes?.[0] || "",
    barcodes: product.barcodes || [product.barcode].filter(Boolean),
    price: toNumber(product.price ?? product.lastPrice),
    cost: toNumber(product.cost),
    updatedAt: product.updatedAt || now(),
  };
};

const syncProductStockSummary = (state, product) => {
  (product.stockSummary || []).forEach((row) => {
    if (!row.warehouseId) return;
    upsertOne(state.entities.stockBalances, {
      id: getBalanceId(product.id, row.warehouseId),
      productId: product.id,
      warehouseId: row.warehouseId,
      onHand: toNumber(row.onHand ?? row.quantity),
      reserved: toNumber(row.reserved),
      incoming: toNumber(row.incoming),
      location: row.location || "",
      updatedAt: now(),
    });
  });
};

const normalizeCustomer = (customer = {}) => ({
  ...customer,
  id: String(customer.id || createBusinessId("cust")),
  name: customer.name || customer.fullName || customer.company || "Mijoz",
  fullName: customer.fullName || customer.name || customer.company || "Mijoz",
  status: customer.status || "active",
  archived: Boolean(customer.archived),
  orderCount: toNumber(customer.orderCount),
  totalSpent: toNumber(customer.totalSpent),
  averageCheck: toNumber(customer.averageCheck),
  bonus: toNumber(customer.bonus || customer.loyaltyBonus),
  updatedAt: customer.updatedAt || now(),
});

const hasPermission = (state, userId, permission) => {
  const user = state.entities.users.byId[userId];
  if (!userId || userId === "system" || userId === "owner") return true;
  if (user?.status === "blocked" || user?.active === false) return false;
  const role = user?.role || "owner";
  const rule = state.settings.permissions?.[role]?.[permission];
  return rule !== "disabled" && rule !== "hidden" && rule !== false;
};

const mutateStock = (state, { productId, warehouseId, quantity, type, document, employeeId, reason }) => {
  const balanceId = getBalanceId(productId, warehouseId);
  const current = state.entities.stockBalances.byId[balanceId] || {
    id: balanceId,
    productId,
    warehouseId,
    onHand: 0,
    reserved: 0,
    incoming: 0,
  };
  const previousStock = toNumber(current.onHand);
  const nextStock = Math.max(0, previousStock + toNumber(quantity));

  upsertOne(state.entities.stockBalances, {
    ...current,
    onHand: nextStock,
    updatedAt: now(),
  });

  const movement = {
    id: createBusinessId(type === "receipt" ? "grm" : "stm"),
    createdAt: now(),
    type,
    productId,
    warehouseId,
    quantity: toNumber(quantity),
    previousStock,
    newStock: nextStock,
    document,
    employeeId,
    reason,
  };

  upsertOne(state.entities.stockMovements, movement);
  state.entities.stockMovements.allIds = [movement.id, ...state.entities.stockMovements.allIds.filter((id) => id !== movement.id)];
  return movement;
};

const businessOSSlice = createSlice({
  name: "businessOS",
  initialState: loadBusinessState(),
  reducers: {
    productsModuleCommitted(state, action) {
      const payload = action.payload || {};
      upsertMany(state.entities.categories, payload.categories || []);
      upsertMany(state.entities.brands, payload.brands || []);
      (payload.products || []).forEach((rawProduct) => {
        const product = normalizeProduct(rawProduct, state);
        upsertOne(state.entities.products, product);
        syncProductStockSummary(state, product);
      });
      addAudit(state, { module: "products", action: "PRODUCT_CATALOG_SYNCED", entity: "products", newValue: `${payload.products?.length || 0} rows` });
    },

    warehouseModuleCommitted(state, action) {
      const payload = action.payload || {};
      upsertMany(state.entities.warehouses, payload.warehouses || []);
      upsertMany(state.entities.stockMovements, payload.movements || []);
      (payload.products || []).forEach((rawProduct) => {
        const product = normalizeProduct(rawProduct, state);
        upsertOne(state.entities.products, product);
        Object.entries(rawProduct.stocks || {}).forEach(([warehouseId, stock]) => {
          upsertOne(state.entities.stockBalances, {
            id: getBalanceId(product.id, warehouseId),
            productId: product.id,
            warehouseId,
            onHand: toNumber(stock.onHand),
            reserved: toNumber(stock.reserved),
            incoming: toNumber(stock.incoming),
            location: stock.location || "",
            updatedAt: now(),
          });
        });
      });
      addAudit(state, { module: "warehouse", action: "WAREHOUSE_STATE_SYNCED", entity: "stockBalances" });
    },

    upsertProduct(state, action) {
      const product = normalizeProduct(action.payload || {}, state);
      upsertOne(state.entities.products, product);
      syncProductStockSummary(state, product);
      addAudit(state, { module: "products", action: "PRODUCT_UPSERTED", entity: "product", entityId: product.id, newValue: product.name });
    },

    upsertCategory(state, action) {
      const category = { id: String(action.payload?.id || createBusinessId("cat")), status: "active", ...action.payload };
      upsertOne(state.entities.categories, category);
      addAudit(state, { module: "products", action: "CATEGORY_UPSERTED", entity: "category", entityId: category.id, newValue: category.name });
    },

    upsertBrand(state, action) {
      const brand = { id: String(action.payload?.id || createBusinessId("brand")), status: "active", ...action.payload };
      upsertOne(state.entities.brands, brand);
      addAudit(state, { module: "products", action: "BRAND_UPSERTED", entity: "brand", entityId: brand.id, newValue: brand.name });
    },

    upsertCustomer(state, action) {
      const customer = normalizeCustomer(action.payload || {});
      upsertOne(state.entities.customers, customer);
      addAudit(state, { module: "crm", action: "CUSTOMER_UPSERTED", entity: "customer", entityId: customer.id, newValue: customer.fullName });
    },

    archiveCustomer(state, action) {
      const customer = state.entities.customers.byId[action.payload];
      if (!customer) return;
      customer.archived = true;
      customer.status = "archived";
      customer.updatedAt = now();
      addAudit(state, { module: "crm", action: "CUSTOMER_ARCHIVED", entity: "customer", entityId: customer.id });
    },

    upsertSupplier(state, action) {
      const supplier = {
        id: String(action.payload?.id || createBusinessId("sup")),
        status: "active",
        blocked: false,
        ...action.payload,
        updatedAt: action.payload?.updatedAt || now(),
      };
      upsertOne(state.entities.suppliers, supplier);
      addAudit(state, { module: "suppliers", action: "SUPPLIER_UPSERTED", entity: "supplier", entityId: supplier.id, newValue: supplier.name });
    },

    hrModuleCommitted(state, action) {
      const payload = action.payload || {};
      upsertMany(state.entities.employees, (payload.employees || []).map((employee) => ({
        ...employee,
        id: String(employee.id),
        name: employee.name || employee.fullName || `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
        status: employee.status || "active",
      })));
      upsertMany(state.entities.branches, payload.branches || []);
      upsertMany(state.entities.shifts, payload.shifts || []);
      addAudit(state, { module: "hr", action: "HR_STATE_SYNCED", entity: "employees", newValue: `${payload.employees?.length || 0} employees` });
    },

    financeModuleCommitted(state, action) {
      const payload = action.payload || {};
      upsertMany(state.entities.transactions, payload.transactions || []);
      upsertMany(state.entities.accounts, payload.accounts || []);
      upsertMany(state.entities.payments, payload.paymentOrders || []);
      addAudit(state, { module: "finance", action: "FINANCE_STATE_SYNCED", entity: "transactions", newValue: `${payload.transactions?.length || 0} transactions` });
    },

    settingsCollectionItemCreated(state, action) {
      const { collection, item } = action.payload || {};
      if (!collection || !item) return;
      const target = collection === "warehouses" ? state.entities.warehouses : collection === "branches" ? state.entities.branches : state.entities[collection];
      if (!target) return;
      const row = { id: item.id || createBusinessId(collection), status: "active", ...item };
      upsertOne(target, row);
      addAudit(state, { module: "settings", action: "SETTINGS_COLLECTION_CREATED", entity: collection, entityId: row.id, newValue: row.name || row.code });
    },

    settingsCollectionItemUpdated(state, action) {
      const { collection, itemId, patch } = action.payload || {};
      const target = collection === "warehouses" ? state.entities.warehouses : collection === "branches" ? state.entities.branches : state.entities[collection];
      if (!target?.byId?.[itemId]) return;
      target.byId[itemId] = { ...target.byId[itemId], ...patch, updatedAt: now() };
      addAudit(state, { module: "settings", action: "SETTINGS_COLLECTION_UPDATED", entity: collection, entityId: itemId, newValue: Object.keys(patch || {}).join(", ") });
    },

    settingsChanged(state, action) {
      state.settings = { ...state.settings, ...(action.payload || {}) };
      addAudit(state, { module: "settings", action: "SETTINGS_CHANGED", entity: "settings", newValue: Object.keys(action.payload || {}).join(", ") });
    },

    stockAdjusted(state, action) {
      const movement = mutateStock(state, action.payload || {});
      addAudit(state, { module: "warehouse", action: "STOCK_ADJUSTED", entity: "stockMovement", entityId: movement.id, newValue: movement.newStock });
    },

    purchaseOrderUpserted(state, action) {
      const order = action.payload;
      if (!order?.id) return;
      upsertOne(state.entities.purchaseOrders, order);
      addAudit(state, { module: "purchases", action: "PURCHASE_ORDER_UPSERTED", entity: "purchaseOrder", entityId: order.id, newValue: order.status });
    },

    purchaseReceived(state, action) {
      const { order, receipt, actorId = "system" } = action.payload || {};
      if (!receipt?.id) return;
      upsertOne(state.entities.purchaseReceipts, receipt);
      if (order?.id) upsertOne(state.entities.purchaseOrders, order);

      (receipt.items || []).forEach((item) => {
        const orderItem = order?.items?.find((row) => row.id === item.itemId);
        const productId = orderItem?.productId || item.productId || item.itemId;
        if (!productId) return;
        mutateStock(state, {
          productId,
          warehouseId: receipt.warehouseId || order?.warehouseId || state.settings.defaultWarehouseId,
          quantity: item.received,
          type: "receipt",
          document: receipt.number || receipt.id,
          employeeId: actorId,
          reason: "PURCHASE_RECEIVED",
        });
      });

      const total = (receipt.items || []).reduce((sum, item) => {
        const orderItem = order?.items?.find((row) => row.id === item.itemId);
        return sum + toNumber(item.received) * toNumber(orderItem?.price || orderItem?.unitPrice || 0);
      }, 0);

      if (total > 0) {
        const transaction = {
          id: createBusinessId("trx"),
          date: now().slice(0, 10),
          type: "expense",
          cashDirection: "out",
          amount: total,
          currency: order?.currency || state.settings.baseCurrency,
          accountId: "2000",
          counterparty: resolveName(state.entities.suppliers, receipt.supplierId, receipt.supplierId),
          reference: receipt.number || receipt.id,
          source: "Purchases",
          description: "Purchase receipt payable",
          status: "Posted",
          branch: order?.branchId || state.settings.defaultBranchId,
        };
        upsertOne(state.entities.transactions, transaction);
      }

      addNotification(state, { type: "purchase", level: "normal", title: "Kirim tasdiqlandi", message: receipt.number || receipt.id });
      addAudit(state, { module: "purchases", action: "PURCHASE_RECEIVED", entity: "purchaseReceipt", entityId: receipt.id, newValue: receipt.number });
    },

    saleCompleted(state, action) {
      const { sale, userId = "system" } = action.payload || {};
      if (!sale?.items?.length) return;
      if (!hasPermission(state, userId, "sales.create")) {
        addAudit(state, { module: "sales", action: "SALE_COMPLETED", entity: "sale", entityId: sale.id, result: "denied" });
        return;
      }

      const warehouseId = sale.warehouseId || state.settings.defaultWarehouseId;
      const blockedItem = sale.items.find((item) => toNumber(item.quantity) > readAvailable(state, item.productId, warehouseId));
      if (blockedItem) {
        addNotification(state, { type: "sale", level: "critical", title: "Savdo bloklandi", message: "Available qoldiq yetarli emas." });
        addAudit(state, { module: "sales", action: "SALE_COMPLETED", entity: "sale", entityId: sale.id, result: "blocked", newValue: blockedItem.productId });
        return;
      }

      const saleId = sale.id || createBusinessId("sale");
      const total = toNumber(sale.totals?.total ?? sale.total);
      const normalizedSale = {
        ...sale,
        id: saleId,
        customerId: sale.customerId || sale.customer?.id || null,
        cashierId: sale.cashierId || userId,
        warehouseId,
        branchId: sale.branchId || state.settings.defaultBranchId,
        total,
        createdAt: sale.createdAt || now(),
      };

      upsertOne(state.entities.sales, normalizedSale);

      sale.items.forEach((item) => {
        const saleItem = {
          id: item.saleItemId || createBusinessId("sale-item"),
          saleId,
          productId: item.productId,
          quantity: toNumber(item.quantity),
          price: toNumber(item.price),
          discount: item.discount || null,
          total: toNumber(item.quantity) * toNumber(item.price),
        };
        upsertOne(state.entities.saleItems, saleItem);
        mutateStock(state, {
          productId: item.productId,
          warehouseId,
          quantity: -saleItem.quantity,
          type: "sale",
          document: normalizedSale.receiptNumber || saleId,
          employeeId: normalizedSale.cashierId,
          reason: "SALE_COMPLETED",
        });
      });

      if (normalizedSale.customerId) {
        const customer = state.entities.customers.byId[normalizedSale.customerId];
        if (customer) {
          const orderCount = toNumber(customer.orderCount) + 1;
          const totalSpent = toNumber(customer.totalSpent) + total;
          upsertOne(state.entities.customers, {
            ...customer,
            orderCount,
            totalSpent,
            averageCheck: orderCount ? Math.round(totalSpent / orderCount) : 0,
            lastPurchase: normalizedSale.createdAt,
            bonus: toNumber(customer.bonus) + Math.floor(total * 0.01),
            updatedAt: now(),
          });
          upsertOne(state.entities.customerActivities, {
            id: createBusinessId("act"),
            customerId: normalizedSale.customerId,
            type: "sale",
            title: "Savdo yakunlandi",
            amount: total,
            entityId: saleId,
            createdAt: normalizedSale.createdAt,
          });
        }
      }

      const transaction = {
        id: createBusinessId("trx"),
        date: normalizedSale.createdAt.slice(0, 10),
        type: "income",
        cashDirection: normalizedSale.payment?.method === "debt" ? "receivable" : "in",
        amount: total,
        currency: state.settings.baseCurrency,
        accountId: normalizedSale.payment?.method === "cash" ? "1000" : "1010",
        counterparty: normalizedSale.customerId ? resolveName(state.entities.customers, normalizedSale.customerId) : "Walk-in customer",
        reference: normalizedSale.receiptNumber || saleId,
        source: "POS",
        description: "POS sale completed",
        status: "Posted",
        branch: normalizedSale.branchId,
        tax: Math.round((total * toNumber(state.settings.taxRate)) / 100),
      };
      upsertOne(state.entities.transactions, transaction);

      addNotification(state, { type: "sale", level: "normal", title: "Savdo yakunlandi", message: normalizedSale.receiptNumber || saleId });
      addAudit(state, { module: "sales", action: "SALE_COMPLETED", entity: "sale", entityId: saleId, newValue: total });
    },
  },
});

export const businessOSActions = businessOSSlice.actions;
export default businessOSSlice.reducer;

export const selectBusinessOS = (state) => state.businessOS;
export const selectEntityList = (entityName) => (state) => list(state.businessOS.entities[entityName]);

export const selectProductsModuleState = (state) => {
  const os = state.businessOS;
  const stockBalances = list(os.entities.stockBalances);
  const warehouses = list(os.entities.warehouses);

  return {
    categories: list(os.entities.categories),
    brands: list(os.entities.brands),
    units: [
      { id: "unit-piece", name: "Dona", code: "dona", base: "dona", ratio: 1 },
      { id: "unit-kg", name: "Kilogram", code: "kg", base: "kg", ratio: 1 },
      { id: "unit-liter", name: "Litr", code: "l", base: "l", ratio: 1 },
    ],
    products: list(os.entities.products).map((product) => ({
      ...product,
      category: os.entities.categories.byId[product.categoryId],
      brand: os.entities.brands.byId[product.brandId],
      stockSummary: stockBalances
        .filter((row) => row.productId === product.id)
        .map((row) => ({
          warehouseId: row.warehouseId,
          warehouseName: warehouses.find((warehouse) => warehouse.id === row.warehouseId)?.name || row.warehouseId,
          onHand: row.onHand,
          reserved: row.reserved,
          incoming: row.incoming,
          available: Math.max(0, toNumber(row.onHand) - toNumber(row.reserved)),
          location: row.location,
        })),
    })),
    priceLists: [],
    notifications: list(os.entities.notifications),
    auditLog: list(os.entities.auditEvents),
    settings: {
      skuPrefix: "ZNX",
      approvalRequiredAboveMarginDrop: 0,
      autoBarcode: true,
      defaultTaxRate: os.settings.taxRate,
      showCostByDefault: false,
      integrations: { pos: true, warehouse: true, crm: true, finance: true },
    },
  };
};

export const selectWarehouseModuleState = (state) => {
  const os = state.businessOS;
  const balances = list(os.entities.stockBalances);

  return {
    warehouses: list(os.entities.warehouses),
    products: list(os.entities.products).map((product) => {
      const stocks = Object.fromEntries(
        balances
          .filter((balance) => balance.productId === product.id)
          .map((balance) => [
            balance.warehouseId,
            {
              onHand: balance.onHand,
              reserved: balance.reserved,
              incoming: balance.incoming,
              location: balance.location,
            },
          ]),
      );

      return {
        ...product,
        category: product.categoryName || resolveName(os.entities.categories, product.categoryId),
        brand: product.brandName || resolveName(os.entities.brands, product.brandId),
        barcode: product.barcode || product.barcodes?.[0] || "",
        minimum: toNumber(product.minimum ?? product.minStock),
        maximum: toNumber(product.maximum ?? product.maxStock, 100),
        movementSpeed: product.movementSpeed || "normal",
        stocks,
      };
    }),
    movements: list(os.entities.stockMovements),
    transfers: [],
    adjustments: [],
    batches: [],
    lots: [],
    serials: [],
    imeis: [],
    locations: [],
    reservations: [],
    reservedStock: [],
    incomingStock: balances.filter((row) => toNumber(row.incoming) > 0),
    writeOffs: [],
    damagedGoods: [],
    counts: [],
    tasks: [],
    suppliers: list(os.entities.suppliers),
    analytics: [],
    reports: [],
    notifications: list(os.entities.notifications),
    auditLog: list(os.entities.auditEvents),
    settings: {
      defaultWarehouseId: os.settings.defaultWarehouseId,
      expiryWarningDays: 30,
    },
  };
};

export const selectPOSProducts = (state) => {
  const os = state.businessOS;
  return list(os.entities.products)
    .filter((product) => product.status !== "archived" && product.status !== "inactive")
    .map((product) => {
      const stock = list(os.entities.stockBalances)
        .filter((balance) => balance.productId === product.id)
        .reduce((sum, balance) => sum + Math.max(0, toNumber(balance.onHand) - toNumber(balance.reserved)), 0);
      return {
        ...product,
        category: product.categoryName || resolveName(os.entities.categories, product.categoryId, "Boshqa"),
        barcode: product.barcode || product.barcodes?.[0] || "",
        stock,
      };
    });
};

export const selectPOSCategories = (state) => [
  "Barchasi",
  ...new Set(selectPOSProducts(state).map((product) => product.category).filter(Boolean)),
];

export const selectPOSCustomers = (state) =>
  list(state.businessOS.entities.customers)
    .filter((customer) => !customer.archived && customer.status !== "archived")
    .map((customer) => ({
      ...customer,
      name: customer.name || customer.fullName,
    }));

export const selectDashboardSummary = (state) => {
  const os = state.businessOS;
  const today = new Date().toISOString().slice(0, 10);
  const sales = list(os.entities.sales);
  const transactions = list(os.entities.transactions);
  const stockBalances = list(os.entities.stockBalances);
  const products = list(os.entities.products);
  const todaySales = sales.filter((sale) => sale.createdAt?.slice(0, 10) === today);
  const revenue = transactions.filter((trx) => trx.type === "income").reduce((sum, trx) => sum + toNumber(trx.amount), 0);
  const expense = transactions.filter((trx) => trx.type === "expense").reduce((sum, trx) => sum + toNumber(trx.amount), 0);
  const lowStock = products.filter((product) => {
    const qty = stockBalances
      .filter((balance) => balance.productId === product.id)
      .reduce((sum, balance) => sum + toNumber(balance.onHand) - toNumber(balance.reserved), 0);
    return qty <= toNumber(product.minimum ?? product.minStock, 0);
  }).length;

  return {
    tenant: { currency: os.settings.baseCurrency.toLowerCase() },
    stats: {
      revenue,
      profit: revenue - expense,
      expenses: expense,
      todaySales: todaySales.reduce((sum, sale) => sum + toNumber(sale.total), 0),
      salesCount: sales.length,
      customers: os.entities.customers.allIds.length,
      lowStock,
      debt: transactions.filter((trx) => trx.cashDirection === "receivable").reduce((sum, trx) => sum + toNumber(trx.amount), 0),
      purchaseDeliveries: os.entities.purchaseReceipts.allIds.length,
      employeeAttendance: os.entities.employees.allIds.length,
      notifications: os.entities.notifications.allIds.length,
    },
    topProducts: products.slice(0, 5).map((product) => ({
      id: product.id,
      name: product.name,
      revenue: sales.reduce((sum, sale) => {
        const amount = (sale.items || []).filter((item) => item.productId === product.id).reduce((lineSum, item) => lineSum + toNumber(item.quantity) * toNumber(item.price), 0);
        return sum + amount;
      }, 0),
      stock: stockBalances.filter((balance) => balance.productId === product.id).reduce((sum, balance) => sum + toNumber(balance.onHand), 0),
    })),
    activity: list(os.entities.auditEvents).slice(0, 8),
    employees: { active: list(os.entities.employees).filter((employee) => employee.status !== "inactive").length },
    meta: { fetchedAt: now(), source: "businessOS" },
  };
};

export const selectReportsDataset = (state) => ({
  sales: list(state.businessOS.entities.sales),
  products: list(state.businessOS.entities.products),
  stock: list(state.businessOS.entities.stockBalances),
  purchases: list(state.businessOS.entities.purchaseOrders),
  suppliers: list(state.businessOS.entities.suppliers),
  customers: list(state.businessOS.entities.customers),
  finance: list(state.businessOS.entities.transactions),
  employees: list(state.businessOS.entities.employees),
  branches: list(state.businessOS.entities.branches),
});
