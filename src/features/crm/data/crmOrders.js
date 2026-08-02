export const crmOrderStatuses = [
  { id: "completed", label: "Yakunlangan" },
  { id: "pending", label: "Kutilmoqda" },
  { id: "cancelled", label: "Bekor qilingan" },
  { id: "returned", label: "Qaytarilgan" },
];

export const crmOrders = [];

export const getCustomerOrders = (customerId) =>
  crmOrders
    .filter((order) => String(order.customerId) === String(customerId))
    .sort(
      (firstOrder, secondOrder) =>
        new Date(secondOrder.createdAt).getTime() -
        new Date(firstOrder.createdAt).getTime(),
    );

export const getCustomerOrderSummary = (customerId) => {
  const orders = getCustomerOrders(customerId);
  const validOrders = orders.filter((order) => order.status !== "cancelled");
  const netSpent = validOrders.reduce(
    (total, order) =>
      total +
      Number(order.total || 0) -
      Number(order.returnedAmount || 0),
    0,
  );
  const returnedAmount = validOrders.reduce(
    (total, order) => total + Number(order.returnedAmount || 0),
    0,
  );

  return {
    orderCount: validOrders.length,
    netSpent,
    returnedAmount,
    averageCheck: validOrders.length > 0 ? Math.round(netSpent / validOrders.length) : 0,
  };
};
