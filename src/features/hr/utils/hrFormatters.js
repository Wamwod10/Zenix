export const formatMoney = (value) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatNumber = (value) =>
  new Intl.NumberFormat("uz-UZ").format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
};

export const formatEmployeeName = (employee) =>
  employee ? `${employee.firstName} ${employee.lastName}` : "Noma'lum";

export const yearsBetween = (from, to = new Date()) => {
  if (!from) return 0;
  const start = new Date(from);
  const end = new Date(to);
  let years = end.getFullYear() - start.getFullYear();
  const monthDelta = end.getMonth() - start.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && end.getDate() < start.getDate())) {
    years -= 1;
  }
  return Math.max(0, years);
};
