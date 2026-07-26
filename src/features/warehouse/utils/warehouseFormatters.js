export const formatQuantity = (value, unit = "dona") =>
  `${new Intl.NumberFormat("uz-UZ").format(Number(value || 0))} ${unit}`;

export const formatMoney = (value, currency = "UZS") =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const formatDateTime = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const percent = (value) => `${Math.round(Number(value || 0))}%`;
