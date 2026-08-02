import { filterLabels, reportTitles, valueLabels } from "../data/reportsMockData";

export const clampNumber = (value, min = 0, max = 100) => {
  const next = Number(value);
  if (Number.isNaN(next)) return min;
  return Math.min(max, Math.max(min, next));
};

export const formatReportValue = (value, unit = "") => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  if (unit === "UZS") {
    if (safeValue >= 1000000000) return `${(safeValue / 1000000000).toFixed(2)} mlrd so'm`;
    if (safeValue >= 1000000) return `${Math.round(safeValue / 1000000)} mln so'm`;
    return `${safeValue.toLocaleString("uz-UZ")} so'm`;
  }

  if (unit === "%") return `${Math.round(clampNumber(safeValue))}%`;
  if (unit === "people") return `${Math.round(safeValue).toLocaleString("uz-UZ")} kishi`;
  if (unit === "orders") return `${Math.round(safeValue).toLocaleString("uz-UZ")} ta`;
  if (unit === "duration") return `${Math.round(safeValue)} daqiqa`;

  return safeValue.toLocaleString("uz-UZ");
};

export const formatSignedPercent = (value) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${safeValue > 0 ? "+" : ""}${safeValue.toFixed(1)}%`;
};

export const getReportTitle = (id = "") => reportTitles[id] || id;

export const getFilterLabel = (key = "") => filterLabels[key] || key;

export const getValueLabel = (value = "") => valueLabels[value] || value;

export const formatTableCell = (value, type = "text") => {
  if (type === "currency") return formatReportValue(value, "UZS");
  if (type === "percent") return formatSignedPercent(value);
  if (type === "status") return getValueLabel(value);
  return value || "-";
};

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
    .replace(/[`'']/g, "")
    .replace(/\s+/g, " ")
    .trim();
