// CRM Calculations
export const calculateTotalRevenue = (orders) => {
  return orders.reduce((sum, order) => sum + order.amount, 0);
};

export const calculateAverageOrderValue = (orders) => {
  if (orders.length === 0) return 0;
  return calculateTotalRevenue(orders) / orders.length;
};
