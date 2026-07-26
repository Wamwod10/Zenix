export const formatReportValue = (value, unit = "") => {
  if (unit === "UZS") {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)} mlrd`;
    if (value >= 1000000) return `${Math.round(value / 1000000)} mln`;
    return `${value.toLocaleString("uz-UZ")} so'm`;
  }

  if (unit === "%") return `${Math.round(value)}%`;
  if (unit === "people") return `${Math.round(value).toLocaleString("uz-UZ")} kishi`;
  if (unit === "orders") return `${Math.round(value).toLocaleString("uz-UZ")} ta`;

  return Number(value).toLocaleString("uz-UZ");
};

export const formatSignedPercent = (value) => `${value > 0 ? "+" : ""}${Number(value).toFixed(1)}%`;

export const formatDateTime = (date = new Date()) =>
  new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

export const normalizeSearch = (value = "") =>
  value
    .toLowerCase()
    .replace(/[`'’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
