const uzsFormatter = new Intl.NumberFormat("uz-UZ", {
  style: "currency",
  currency: "UZS",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("uz-UZ", {
  maximumFractionDigits: 2,
});

export const formatMoney = (value = 0, currency = "UZS") => {
  const amount = Number(value || 0);

  if (currency === "UZS") {
    return uzsFormatter.format(amount);
  }

  return `${numberFormatter.format(amount)} ${currency}`;
};

export const formatCurrency = formatMoney;

export const formatPercent = (value = 0) =>
  `${numberFormatter.format(Number(value || 0))}%`;

export const formatDate = (date) =>
  new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

export const formatDateTime = (date) =>
  new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
