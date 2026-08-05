const entityList = (state, entityName) => {
  const entity = state.businessOS?.entities?.[entityName];
  return (entity?.allIds || []).map((id) => entity.byId?.[id]).filter(Boolean);
};

export const selectCrmHubSummary = (state) => {
  const customers = entityList(state, "customers");
  const customerActivities = entityList(state, "customerActivities");
  const sales = entityList(state, "sales");
  const today = new Date().toISOString().slice(0, 10);

  const activeCustomers = customers.filter(
    (customer) =>
      customer.status === "active" ||
      customer.status === "faol" ||
      (!customer.archived && customer.status !== "archived"),
  );
  const debtors = customers.filter((customer) => Number(customer.debt || 0) > 0);
  const highRisk = customers.filter((customer) => Number(customer.churnRisk || 0) >= 70);
  const vipCustomers = customers.filter(
    (customer) =>
      customer.loyaltyLevel === "vip" ||
      customer.group === "vip" ||
      Number(customer.totalSpent || 0) >= 5000000,
  );
  const openActivities = customerActivities.filter(
    (activity) => !["done", "completed", "closed"].includes(String(activity.status || "").toLowerCase()),
  );
  const completedSales = sales.filter((sale) =>
    ["completed", "paid"].includes(String(sale.status || "").toLowerCase()),
  );
  const newCustomersToday = customers.filter((customer) =>
    String(customer.createdAt || customer.updatedAt || "").slice(0, 10) === today,
  );
  const segmentCount = new Set(customers.map((customer) => customer.segment || customer.group).filter(Boolean)).size;

  return {
    customersTotal: customers.length,
    activeCustomers: activeCustomers.length,
    newCustomersToday: newCustomersToday.length,
    debtors: debtors.length,
    highRisk: highRisk.length,
    vipCustomers: vipCustomers.length,
    customerActivities: customerActivities.length,
    openActivities: openActivities.length,
    completedSales: completedSales.length,
    segmentCount,
    activeCampaigns: null,
  };
};
