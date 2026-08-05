import { selectDashboardSummary } from "../../../core/businessOS/businessOSSlice";

const entityList = (state, entityName) => {
  const entity = state.businessOS?.entities?.[entityName];
  return (entity?.allIds || []).map((id) => entity.byId?.[id]).filter(Boolean);
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const isToday = (value, today) => String(value || "").slice(0, 10) === today;

const isOpenStatus = (status) =>
  !["closed", "completed", "paid", "posted", "cancelled", "canceled", "done", "archived"].includes(
    String(status || "").toLowerCase(),
  );

const stockAvailableByProduct = (stockBalances = []) =>
  stockBalances.reduce((map, balance) => {
    const productId = balance.productId;
    if (!productId) return map;

    map.set(
      productId,
      (map.get(productId) || 0) + toNumber(balance.onHand) - toNumber(balance.reserved),
    );

    return map;
  }, new Map());

export const selectDashboardHubData = (state) => {
  const summary = selectDashboardSummary(state);
  const today = new Date().toISOString().slice(0, 10);
  const products = entityList(state, "products");
  const stockBalances = entityList(state, "stockBalances");
  const customers = entityList(state, "customers");
  const warehouses = entityList(state, "warehouses");
  const purchaseOrders = entityList(state, "purchaseOrders");
  const purchaseReceipts = entityList(state, "purchaseReceipts");
  const suppliers = entityList(state, "suppliers");
  const supplierProducts = entityList(state, "supplierProducts");
  const transactions = entityList(state, "transactions");
  const payments = entityList(state, "payments");
  const employees = entityList(state, "employees");
  const shifts = entityList(state, "shifts");
  const auditEvents = entityList(state, "auditEvents");
  const users = entityList(state, "users");
  const stats = summary.stats || {};
  const availableByProduct = stockAvailableByProduct(stockBalances);

  const activeProducts = products.filter((product) => product.status !== "archived");
  const lowStockProducts = activeProducts.filter((product) => {
    const minimum = toNumber(product.minimum ?? product.minStock);
    if (!minimum) return false;
    return (availableByProduct.get(product.id) || 0) <= minimum;
  });
  const outOfStockProducts = activeProducts.filter(
    (product) => (availableByProduct.get(product.id) || 0) <= 0,
  );
  const activeCustomers = customers.filter(
    (customer) => !customer.archived && customer.status !== "archived",
  );
  const newCustomersToday = customers.filter((customer) =>
    isToday(customer.createdAt || customer.updatedAt, today),
  );
  const atRiskCustomers = customers.filter((customer) => toNumber(customer.churnRisk) >= 70);
  const activePurchaseOrders = purchaseOrders.filter((order) => isOpenStatus(order.status));
  const duePurchaseOrdersToday = activePurchaseOrders.filter((order) =>
    isToday(order.expectedDate || order.deliveryDate || order.dueDate, today),
  );
  const pendingPurchaseApprovals = activePurchaseOrders.filter((order) =>
    ["pending", "approval", "pending_approval"].some((key) =>
      String(order.status || order.approvalStatus || "").toLowerCase().includes(key),
    ),
  );
  const activeSuppliers = suppliers.filter(
    (supplier) => !supplier.archived && supplier.status !== "archived" && supplier.blocked !== true,
  );
  const preferredSuppliers = activeSuppliers.filter((supplier) =>
    (supplier.supplierProducts || []).some((item) => item.isPreferredSupplier),
  );
  const supplierDebt = activeSuppliers.filter(
    (supplier) => toNumber(supplier.balance || supplier.debt || supplier.payable) > 0,
  );
  const pendingPayments = payments.filter((payment) => isOpenStatus(payment.status)).length;
  const pendingTransactions = transactions.filter((transaction) => isOpenStatus(transaction.status)).length;
  const activeEmployees = employees.filter((employee) => employee.status !== "inactive");
  const activeShiftsToday = shifts.filter((shift) => isToday(shift.date || shift.openedAt, today)).length;
  const todayStockMovements = stockBalances.length
    ? entityList(state, "stockMovements").filter((movement) =>
        isToday(movement.createdAt || movement.timestamp, today),
      ).length
    : 0;
  const activeUsers = users.filter((user) => user.status !== "blocked" && user.active !== false);

  return {
    summary,
    currency: summary?.tenant?.currency ?? "uzs",
    branchName:
      summary?.tenant?.branchName ||
      entityList(state, "branches").find((branch) => branch.id === state.businessOS?.settings?.defaultBranchId)
        ?.name ||
      "Barcha filiallar",
    periodLabel: "Bugun",
    metrics: {
      todaySales: toNumber(stats.todaySales),
      yesterdaySales: toNumber(stats.yesterdaySales),
      netProfit: toNumber(stats.netProfit),
      profitMargin: stats.profitMargin,
      expenses: toNumber(stats.expenses),
      ordersToday: toNumber(stats.ordersToday ?? stats.todayOrders),
      lowStockCount: lowStockProducts.length || toNumber(stats.lowStockCount),
      outOfStockCount: outOfStockProducts.length,
      debt: toNumber(stats.debt),
      productsTotal: activeProducts.length,
      customersTotal: customers.length,
      activeCustomers: activeCustomers.length,
      newCustomersToday: newCustomersToday.length,
      atRiskCustomers: atRiskCustomers.length,
      warehousesTotal: warehouses.length,
      todayStockMovements,
      activePurchaseOrders: activePurchaseOrders.length,
      duePurchaseOrdersToday: duePurchaseOrdersToday.length,
      pendingPurchaseApprovals: pendingPurchaseApprovals.length,
      purchaseReceipts: purchaseReceipts.length,
      activeSuppliers: activeSuppliers.length,
      preferredSuppliers: preferredSuppliers.length || supplierProducts.filter((item) => item.isPreferredSupplier).length,
      supplierDebt: supplierDebt.length,
      pendingPayments: pendingPayments + pendingTransactions,
      employeesTotal: activeEmployees.length,
      activeShiftsToday,
      reportsSaved: null,
      reportsScheduled: null,
      activeUsers: activeUsers.length,
      auditEvents: auditEvents.length,
    },
    activity: auditEvents.slice(0, 7),
  };
};
