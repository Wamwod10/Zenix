import { createSlice } from "@reduxjs/toolkit";

import { createEmptyEntity, loadBusinessState, upsertMany } from "./businessPersistence.js";
import {
  enforceSinglePreferredSupplier,
  normalizeProductCatalogRecord,
  normalizeSupplierProductRelations,
  upsertSupplierProductRelation,
} from "./erpProductModel.js";
import {
  calculateReceiptCost,
  createInventoryLayer,
  resolveReceiptUnitCost,
} from "../../features/warehouse/utils/inventoryCostEngine.js";

const now = () => new Date().toISOString();

const createBusinessId = (prefix) =>
  `${prefix}-${
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${(typeof performance !== "undefined" ? performance.now() : createBusinessId.counter)
          .toString(36)
          .replace(".", "")}-${String(createBusinessId.counter += 1).padStart(4, "0")}`
  }`;

createBusinessId.counter = 0;

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

const isCompletedSaleStatus = (status) =>
  ["completed", "paid"].includes(String(status || "").toLowerCase());

const calculateSaleDiscountAmount = (subtotal = 0, discount = null) => {
  const safeSubtotal = Math.max(toNumber(subtotal), 0);
  const value = Math.max(toNumber(discount?.value ?? discount), 0);

  if (!safeSubtotal || !value) return 0;

  const amount = discount?.type === "percentage"
    ? Math.round((safeSubtotal * Math.min(value, 100)) / 100)
    : value;

  return Math.min(amount, safeSubtotal);
};

const resolveSaleUnitCost = (product = {}, item = {}) => {
  const candidates = [
    product.currentCost,
    product.cost,
    product.lastPurchaseCost,
    product.averageCost,
    product.standardCost,
    item.unitCost,
  ].map((value) => toNumber(value));

  return candidates.find((value) => value > 0) ?? 0;
};

const addAudit = (state, event) => {
  const audit = {
    id: createBusinessId("audit"),
    at: now(),
    timestamp: event.timestamp || now(),
    userId: event.userId || "system",
    user: event.user || event.userId || "system",
    role: event.role || "",
    module: event.module || "core",
    entity: event.entity || "",
    entityId: event.entityId || "",
    productId: event.productId || "",
    supplierId: event.supplierId || "",
    supplierProductId: event.supplierProductId || "",
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
  const normalized = normalizeProductCatalogRecord(product);

  return {
    ...normalized,
    id: String(product.id || createBusinessId("prd")),
    categoryId,
    brandId,
    categoryName: product.categoryName || resolveName(state.entities.categories, categoryId, product.category?.name || product.category),
    brandName: product.brandName || resolveName(state.entities.brands, brandId, product.brand?.name || product.brand),
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
      const relationState = normalizeSupplierProductRelations(action.payload || {});
      const supplier = {
        id: String(action.payload?.id || createBusinessId("sup")),
        status: "active",
        blocked: false,
        ...action.payload,
        ...relationState,
        updatedAt: action.payload?.updatedAt || now(),
      };
      upsertOne(state.entities.suppliers, supplier);
      upsertMany(state.entities.supplierProducts, relationState.supplierProducts || []);
      addAudit(state, { module: "suppliers", action: "SUPPLIER_UPSERTED", entity: "supplier", entityId: supplier.id, newValue: supplier.name });
    },

    linkProductToSupplier(state, action) {
      const { supplierId, productId, terms = {}, userId = "system" } = action.payload || {};
      const supplier = state.entities.suppliers.byId[supplierId];
      const product = state.entities.products.byId[productId];
      if (!supplier || !product) {
        addAudit(state, {
          module: "suppliers",
          action: "PRODUCT_SUPPLIER_LINK_FAILED",
          entity: "supplierProduct",
          productId,
          supplierId,
          userId,
          result: "denied",
          source: terms.source || "domain_action",
        });
        return;
      }

      const relationState = upsertSupplierProductRelation(supplier, productId, {
        ...terms,
        source: terms.source || "domain_action",
        changedBy: userId,
      });
      const nextSupplier = { ...supplier, ...relationState, updatedAt: now() };
      upsertOne(state.entities.suppliers, nextSupplier);
      upsertMany(state.entities.supplierProducts, relationState.supplierProducts || []);

      if (terms.isPreferredSupplier) {
        const enforced = enforceSinglePreferredSupplier(list(state.entities.suppliers), productId, supplierId);
        upsertMany(state.entities.suppliers, enforced);
        enforced.forEach((entry) => {
          const normalized = normalizeSupplierProductRelations(entry);
          upsertMany(state.entities.supplierProducts, normalized.supplierProducts || []);
        });
      }

      addAudit(state, {
        module: "suppliers",
        action: "PRODUCT_LINKED_TO_SUPPLIER",
        entity: "supplierProduct",
        entityId: `${supplierId}:${productId}`,
        productId,
        supplierId,
        supplierProductId: `${supplierId}:${productId}`,
        userId,
        newValue: terms,
        source: terms.source || "domain_action",
      });
    },

    updateSupplierTerms(state, action) {
      businessOSSlice.caseReducers.linkProductToSupplier(state, action);
    },

    changeSupplierPrice(state, action) {
      const { supplierId, productId, newPrice, reason = "", userId = "system" } = action.payload || {};
      businessOSSlice.caseReducers.linkProductToSupplier(state, {
        payload: {
          supplierId,
          productId,
          userId,
          terms: {
            purchasePrice: newPrice,
            reason,
            source: "manual_price_change",
          },
        },
      });
    },

    setPreferredSupplier(state, action) {
      const { supplierId, productId, userId = "system" } = action.payload || {};
      const enforced = enforceSinglePreferredSupplier(list(state.entities.suppliers), productId, supplierId);
      upsertMany(state.entities.suppliers, enforced);
      enforced.forEach((supplier) => {
        const relationState = normalizeSupplierProductRelations(supplier);
        upsertMany(state.entities.supplierProducts, relationState.supplierProducts || []);
      });
      addAudit(state, {
        module: "suppliers",
        action: "PREFERRED_SUPPLIER_CHANGED",
        entity: "supplierProduct",
        entityId: `${supplierId}:${productId}`,
        supplierProductId: `${supplierId}:${productId}`,
        productId,
        supplierId,
        userId,
      });
    },

    archiveSupplierProduct(state, action) {
      const { supplierId, productId, userId = "system" } = action.payload || {};
      const supplier = state.entities.suppliers.byId[supplierId];
      if (!supplier) return;
      const relationState = upsertSupplierProductRelation(supplier, productId, {
        status: "archived",
        isPreferredSupplier: false,
        source: "archive_supplier_product",
      });
      const nextSupplier = { ...supplier, ...relationState, updatedAt: now() };
      upsertOne(state.entities.suppliers, nextSupplier);
      upsertMany(state.entities.supplierProducts, relationState.supplierProducts || []);
      addAudit(state, {
        module: "suppliers",
        action: "SUPPLIER_PRODUCT_ARCHIVED",
        entity: "supplierProduct",
        entityId: `${supplierId}:${productId}`,
        supplierProductId: `${supplierId}:${productId}`,
        productId,
        supplierId,
        userId,
      });
    },

    unlinkProductFromSupplier(state, action) {
      const { supplierId, productId, userId = "system" } = action.payload || {};
      businessOSSlice.caseReducers.archiveSupplierProduct(state, {
        payload: { supplierId, productId, userId },
      });
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
      upsertMany(
        state.entities.purchaseItems,
        (order.items || []).map((item) => ({
          ...item,
          id: item.purchaseItemId || item.id,
          purchaseOrderId: order.id,
          supplierId: item.supplierId || order.supplierId,
          purchasePrice: toNumber(item.purchasePrice ?? item.price),
          currency: item.currency || order.currency || state.settings.baseCurrency,
          exchangeRate: toNumber(item.exchangeRate || order.exchangeRate || 1, 1),
          createdAt: item.createdAt || order.createdAt || now(),
        })),
      );
      addAudit(state, { module: "purchases", action: "PURCHASE_ORDER_UPSERTED", entity: "purchaseOrder", entityId: order.id, newValue: order.status });
    },

    purchaseReceived(state, action) {
      const { order, receipt, actorId = "system" } = action.payload || {};
      if (!receipt?.id) return;
      upsertOne(state.entities.purchaseReceipts, receipt);
      if (order?.id) upsertOne(state.entities.purchaseOrders, order);
      if (order?.items?.length) {
        upsertMany(
          state.entities.purchaseItems,
          order.items.map((item) => ({
            ...item,
            id: item.purchaseItemId || item.id,
            purchaseOrderId: order.id,
            supplierId: item.supplierId || order.supplierId,
            purchasePrice: toNumber(item.purchasePrice ?? item.price),
            currency: item.currency || order.currency || state.settings.baseCurrency,
            exchangeRate: toNumber(item.exchangeRate || order.exchangeRate || 1, 1),
            createdAt: item.createdAt || order.createdAt || now(),
          })),
        );
      }

      (receipt.items || []).forEach((item) => {
        const orderItem = order?.items?.find((row) => row.id === item.itemId);
        const productId = orderItem?.productId || item.productId || item.itemId;
        if (!productId) return;
        const warehouseId = receipt.warehouseId || order?.warehouseId || state.settings.defaultWarehouseId;
        const balance = state.entities.stockBalances.byId[getBalanceId(productId, warehouseId)];
        const product = state.entities.products.byId[productId];
        const allocation = (receipt.landedCostAllocations || []).find(
          (entry) => entry.itemId === item.itemId,
        );
        const receivedQuantity = toNumber(item.received);
        const unitFactor = toNumber(orderItem?.unitFactor, 1) || 1;
        const catalogCost = toNumber(product?.currentCost ?? product?.cost ?? product?.standardCost);
        const orderedUnitCostRaw =
          toNumber(orderItem?.purchasePrice ?? orderItem?.price ?? orderItem?.unitPrice ?? 0) /
          unitFactor;
        const orderedUnitCost = orderedUnitCostRaw > 0 ? orderedUnitCostRaw : catalogCost;
        const landedUnitCost = toNumber(allocation?.unitCostAdded);
        const receiptUnitCost = resolveReceiptUnitCost({
          purchasePrice: orderedUnitCost,
          discountType: orderItem?.discountType,
          discountValue: orderItem?.discountValue,
          discount: orderItem?.discount ?? orderItem?.discountPercent,
          vat: orderItem?.vatRate ?? orderItem?.vat ?? orderItem?.taxRate,
          taxInclusive: orderItem?.taxInclusive,
          landedUnitCost,
          exchangeRate: order?.exchangeRate || 1,
          includeDiscountInCost: state.settings.inventoryCostOptions?.includeDiscountInCost,
          includeVatInCost: state.settings.inventoryCostOptions?.includeVatInCost,
        });
        const previousCost = toNumber(product?.currentCost ?? product?.cost);
        const previousQuantity = toNumber(balance?.onHand);
        const nextCost = calculateReceiptCost({
          method: state.settings.inventoryCostMethod,
          currentStock: previousQuantity,
          currentCost: previousCost,
          standardCost: product?.standardCost,
          purchasePrice: receiptUnitCost,
          newQty: receivedQuantity,
        });

        if (product && receivedQuantity > 0 && receiptUnitCost >= 0) {
          upsertOne(state.entities.inventoryLayers, createInventoryLayer({
            productId,
            warehouseId,
            receiptId: receipt.id,
            receiptItemId: item.itemId,
            quantity: receivedQuantity,
            unitCost: receiptUnitCost,
            currency: state.settings.baseCurrency,
            receivedAt: receipt.receivedAt || now(),
          }));
          upsertOne(state.entities.products, {
            ...product,
            currentCost: nextCost,
            cost: nextCost,
            standardCost: toNumber(product.standardCost) > 0 ? toNumber(product.standardCost) : nextCost,
            lastPurchaseCost: receiptUnitCost,
            lastPurchasePrice: orderedUnitCost,
            lastPurchaseDate: receipt.receivedAt || now(),
            costHistory: [
              {
                id: createBusinessId("cost"),
                source: "purchase_receipt",
                orderId: order?.id || "",
                receiptId: receipt.id,
                supplierId: receipt.supplierId,
                warehouseId,
                quantity: receivedQuantity,
                purchasePrice: orderedUnitCost,
                landedUnitCost,
                unitCost: receiptUnitCost,
                previousCost,
                currentCost: nextCost,
                at: receipt.receivedAt || now(),
              },
              ...(product.costHistory || []),
            ].slice(0, 200),
            updatedAt: now(),
          });
        }

        mutateStock(state, {
          productId,
          warehouseId,
          quantity: receivedQuantity,
          type: "receipt",
          document: receipt.number || receipt.id,
          employeeId: actorId,
          reason: "PURCHASE_RECEIVED",
        });

        const supplierId = receipt.supplierId || order?.supplierId;
        const supplier = state.entities.suppliers.byId[supplierId];
        if (supplier && receivedQuantity > 0) {
          const relationState = upsertSupplierProductRelation(supplier, productId, {
            id: orderItem?.supplierProductId,
            purchasePrice: orderedUnitCost,
            currency: orderItem?.supplierCurrency || orderItem?.currency || order?.currency || state.settings.baseCurrency,
            discountType: orderItem?.discountType,
            discountValue: orderItem?.discountValue,
            discount: orderItem?.discount ?? orderItem?.discountPercent,
            taxId: orderItem?.taxId,
            vatRate: orderItem?.vatRate ?? orderItem?.vat ?? orderItem?.taxRate,
            vat: orderItem?.vatRate ?? orderItem?.vat ?? orderItem?.taxRate,
            taxInclusive: orderItem?.taxInclusive,
            minimumOrderQty: orderItem?.moq,
            leadTime: orderItem?.leadTime,
            lastPurchasePrice: orderedUnitCost,
            lastPurchaseDate: receipt.receivedAt || now(),
            changedBy: actorId,
            reason: "Receipt accepted",
            source: "purchase_receipt",
          });
          const nextSupplier = {
            ...supplier,
            ...relationState,
            updatedAt: now(),
          };
          upsertOne(state.entities.suppliers, nextSupplier);
          upsertMany(state.entities.supplierProducts, relationState.supplierProducts || []);
          addAudit(state, {
            module: "suppliers",
            action: "SUPPLIER_PRODUCT_LAST_PURCHASE_UPDATED",
            entity: "supplierProduct",
            entityId: orderItem?.supplierProductId || `${supplierId}:${productId}`,
            userId: actorId,
            productId,
            supplierId,
            newValue: orderedUnitCost,
            source: "purchase_receipt",
          });
        }
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
      const saleId = sale.id || createBusinessId("sale");
      const existingSale = state.entities.sales.byId[saleId];
      if (existingSale && isCompletedSaleStatus(existingSale.status)) {
        addAudit(state, { module: "sales", action: "SALE_COMPLETED_DUPLICATE_IGNORED", entity: "sale", entityId: saleId });
        return;
      }
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

      const total = toNumber(sale.totals?.total ?? sale.total);
      const itemSubtotals = sale.items.map((item) => toNumber(item.quantity) * toNumber(item.price));
      const itemDiscounts = sale.items.map((item, index) =>
        calculateSaleDiscountAmount(itemSubtotals[index], item.discount),
      );
      const postItemDiscountTotal = itemSubtotals.reduce(
        (sum, subtotal, index) => sum + Math.max(subtotal - itemDiscounts[index], 0),
        0,
      );
      const orderDiscount = calculateSaleDiscountAmount(postItemDiscountTotal, sale.discount);
      const normalizedSale = {
        ...sale,
        id: saleId,
        status: sale.status || "completed",
        paymentStatus: sale.payment?.method === "debt" ? "receivable" : "paid",
        customerId: sale.customerId || sale.customer?.id || null,
        cashierId: sale.cashierId || userId,
        warehouseId,
        branchId: sale.branchId || state.settings.defaultBranchId,
        total,
        createdAt: sale.createdAt || now(),
      };

      let cogsAmount = 0;
      let revenueAmount = 0;

      sale.items.forEach((item, index) => {
        const product = state.entities.products.byId[item.productId];
        const unitCost = resolveSaleUnitCost(product, item);
        const lineSubtotal = itemSubtotals[index];
        const itemDiscount = itemDiscounts[index];
        const subtotalAfterItemDiscount = Math.max(lineSubtotal - itemDiscount, 0);
        const allocatedOrderDiscount = postItemDiscountTotal > 0
          ? Math.round((orderDiscount * subtotalAfterItemDiscount) / postItemDiscountTotal)
          : 0;
        const lineDiscount = itemDiscount + allocatedOrderDiscount;
        const lineRevenue = Math.max(subtotalAfterItemDiscount - allocatedOrderDiscount, 0);
        const saleItem = {
          id: item.saleItemId || createBusinessId("sale-item"),
          saleId,
          productId: item.productId,
          quantity: toNumber(item.quantity),
          price: toNumber(item.price),
          sellingPrice: toNumber(item.price),
          unitCost,
          discount: item.discount || null,
          discountAmount: lineDiscount,
          total: lineRevenue,
          totalCost: toNumber(item.quantity) * unitCost,
          costTotal: toNumber(item.quantity) * unitCost,
          grossProfit: lineRevenue - toNumber(item.quantity) * unitCost,
        };
        cogsAmount += saleItem.costTotal;
        revenueAmount += saleItem.total;
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

      normalizedSale.revenue = revenueAmount || total;
      normalizedSale.discountAmount = toNumber(sale.totals?.discount) || itemDiscounts.reduce((sum, value) => sum + value, 0) + orderDiscount;
      normalizedSale.cogsAmount = cogsAmount;
      normalizedSale.grossProfit = (revenueAmount || total) - cogsAmount;
      normalizedSale.itemCount = sale.items.reduce((sum, item) => sum + toNumber(item.quantity), 0);
      upsertOne(state.entities.sales, normalizedSale);

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
        amount: normalizedSale.revenue,
        cogsAmount,
        grossProfit: normalizedSale.grossProfit,
        currency: state.settings.baseCurrency,
        accountId: normalizedSale.payment?.method === "cash" ? "1000" : "1010",
        counterparty: normalizedSale.customerId ? resolveName(state.entities.customers, normalizedSale.customerId) : "Walk-in customer",
        reference: normalizedSale.receiptNumber || saleId,
        source: "POS",
        sourceId: saleId,
        category: "Mahsulot savdosi",
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
      inventoryCostMethod: os.settings.inventoryCostMethod || "weighted_average",
      inventoryCostOptions: os.settings.inventoryCostOptions || {},
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
      inventoryCostMethod: os.settings.inventoryCostMethod || "weighted_average",
      inventoryCostOptions: os.settings.inventoryCostOptions || {},
    },
  };
};

export const selectPOSProducts = (state) => {
  const os = state.businessOS;
  return list(os.entities.products)
    .filter((product) => product.status === "active")
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
  const saleItems = list(os.entities.saleItems);
  const transactions = list(os.entities.transactions);
  const stockBalances = list(os.entities.stockBalances);
  const products = list(os.entities.products);
  const completedSales = sales.filter((sale) => isCompletedSaleStatus(sale.status));
  const todaySales = completedSales.filter((sale) => sale.createdAt?.slice(0, 10) === today);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const yesterdaySales = completedSales.filter((sale) => sale.createdAt?.slice(0, 10) === yesterday);
  const sumSaleRevenue = (rows) => rows.reduce((sum, sale) => sum + toNumber(sale.revenue ?? sale.total), 0);
  const sumSaleCogs = (rows) => rows.reduce((sum, sale) => {
    if (sale.cogsAmount !== undefined) return sum + toNumber(sale.cogsAmount);
    return sum + saleItems
      .filter((item) => item.saleId === sale.id)
      .reduce((lineSum, item) => lineSum + toNumber(item.totalCost ?? item.costTotal ?? toNumber(item.unitCost) * toNumber(item.quantity)), 0);
  }, 0);
  const todayRevenue = sumSaleRevenue(todaySales);
  const yesterdayRevenue = sumSaleRevenue(yesterdaySales);
  const todayCogs = sumSaleCogs(todaySales);
  const todayNetProfit = todayRevenue - todayCogs;
  const revenue = transactions.filter((trx) => trx.type === "income").reduce((sum, trx) => sum + toNumber(trx.amount), 0);
  const expense = transactions.filter((trx) => trx.type === "expense").reduce((sum, trx) => sum + toNumber(trx.amount), 0);
  const transactionCogs = transactions.reduce((sum, trx) => sum + toNumber(trx.cogsAmount), 0);
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
      profit: revenue - transactionCogs - expense,
      expenses: expense,
      todaySales: todayRevenue,
      yesterdaySales: yesterdayRevenue,
      netProfit: todayNetProfit,
      grossProfit: todayNetProfit,
      cogs: todayCogs,
      profitMargin: todayRevenue > 0 ? Math.round((todayNetProfit / todayRevenue) * 100) : null,
      salesCount: completedSales.length,
      todayOrders: todaySales.length,
      ordersToday: todaySales.length,
      ordersTotal: completedSales.length,
      ordersCount: todaySales.length,
      avgReceipt: todaySales.length ? Math.round(todayRevenue / todaySales.length) : 0,
      yesterdayAvgReceipt: yesterdaySales.length ? Math.round(yesterdayRevenue / yesterdaySales.length) : 0,
      customers: os.entities.customers.allIds.length,
      customersTotal: os.entities.customers.allIds.length,
      lowStock,
      lowStockCount: lowStock,
      inventoryTotal: products.length,
      debt: transactions.filter((trx) => trx.cashDirection === "receivable").reduce((sum, trx) => sum + toNumber(trx.amount), 0),
      purchaseDeliveries: os.entities.purchaseReceipts.allIds.length,
      employeeAttendance: os.entities.employees.allIds.length,
      notifications: os.entities.notifications.allIds.length,
    },
    topProducts: products.slice(0, 5).map((product) => ({
      id: product.id,
      name: product.name,
      revenue: saleItems
        .filter((item) => completedSales.some((sale) => sale.id === item.saleId) && item.productId === product.id)
        .reduce((sum, item) => sum + toNumber(item.total), 0),
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
