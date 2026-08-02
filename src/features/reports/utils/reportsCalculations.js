import { chartSeries, metricCatalog, tableRows } from "../data/reportsMockData";
import { clampNumber, normalizeSearch } from "./reportsFormatters";

const filterImpact = {
  branch: 0.035,
  warehouse: 0.025,
  employee: 0.018,
  cashier: 0.016,
  supplier: -0.014,
  customer: 0.02,
  product: 0.028,
  category: 0.026,
  brand: 0.012,
  department: 0.017,
  paymentMethod: 0.012,
  status: -0.018,
  region: 0.015,
  risk: -0.04,
  priority: 0.01,
};

export const getFilterMultiplier = (filters) => {
  const impact = Object.entries(filterImpact).reduce((sum, [key, value]) => {
    const selected = filters[key];
    return selected && selected !== "all" ? sum + value : sum;
  }, 0);

  const dateBoost = filters.datePreset === "today" ? -0.08 : filters.datePreset === "year" ? 0.16 : 0;
  return Math.max(0.72, Math.min(1.28, 1 + impact + dateBoost));
};

export const getCalculatedMetrics = (filters) => {
  const multiplier = getFilterMultiplier(filters);

  return metricCatalog.map((metric) => {
    const isPercent = metric.unit === "%";
    const adjustedValue = isPercent
      ? Math.min(100, metric.value + Math.round((multiplier - 1) * 40))
      : Math.round(metric.value * multiplier);
    const adjustedPrevious = isPercent ? metric.previous : Math.round(metric.previous * (multiplier - 0.025));
    const delta = adjustedPrevious ? ((adjustedValue - adjustedPrevious) / adjustedPrevious) * 100 : metric.percent;
    const status = adjustedValue >= metric.goal * 0.9 ? "healthy" : adjustedValue >= metric.goal * 0.7 ? "warning" : "critical";

    return {
      ...metric,
      value: adjustedValue,
      previous: adjustedPrevious,
      percent: Number(delta.toFixed(1)),
      trend: delta >= 0 ? "up" : "down",
      status,
      forecast: isPercent ? Math.min(100, adjustedValue + 2) : Math.round(adjustedValue * 1.055),
      progress: clampNumber(Math.round((adjustedValue / metric.goal) * 100)),
      lastUpdated: "2 daqiqa oldin",
    };
  });
};

export const getChartBounds = (data, keys = ["value", "compare", "forecast"]) => {
  const values = data.flatMap((item) => keys.map((key) => Number(item[key])).filter(Number.isFinite));
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  return min === max ? { min: 0, max: max || 1 } : { min, max };
};

export const scaleChartValue = (value, min, max, inverted = true) => {
  const percent = ((Number(value) - min) / Math.max(1, max - min)) * 100;
  const clamped = clampNumber(percent, 4, 96);
  return inverted ? 100 - clamped : clamped;
};

export const getCalculatedChart = (filters, offset = 0) => {
  const multiplier = getFilterMultiplier(filters);
  return chartSeries.map((item, index) => ({
    ...item,
    value: Math.max(8, Math.round(item.value * multiplier + offset + (index % 3) * 2)),
    compare: Math.max(8, Math.round(item.compare * (multiplier - 0.04) + offset)),
    forecast: Math.max(8, Math.round(item.forecast * (multiplier + 0.03) + offset)),
  }));
};

export const getFilteredRows = (filters, search = "") => {
  const query = normalizeSearch(search);
  const multiplier = getFilterMultiplier(filters);

  return tableRows
    .filter((row) => filters.branch === "all" || row.branch === filters.branch)
    .filter((row) => filters.risk === "all" || row.risk === filters.risk)
    .filter((row) => filters.status === "all" || row.status === filters.status)
    .filter((row) => !query || normalizeSearch(`${row.name} ${row.module} ${row.branch} ${row.owner}`).includes(query))
    .map((row, index) => ({
    ...row,
      department: row.module === "HR" ? "HR" : row.module,
      value: Math.round(row.value * multiplier),
      change: Number((row.change + (multiplier - 1) * 30 + index * 0.2).toFixed(1)),
    }));
};

export const getComparisonResult = (metrics, mode) => {
  const primary = metrics[0];
  const secondary = metrics[1] || metrics[0];
  const modes = {
    "today-yesterday": "Bugun vs kecha",
    "week-week": "Hafta vs o'tgan hafta",
    "month-month": "Oy vs o'tgan oy",
    "year-year": "Yil vs o'tgan yil",
    "branch-branch": "Filial vs filial",
    "product-product": "Mahsulot vs mahsulot",
    "employee-employee": "Xodim vs xodim",
    "supplier-supplier": "Yetkazib beruvchi vs yetkazib beruvchi",
  };
  const diff = primary.value - secondary.previous;
  const percent = secondary.previous ? (diff / secondary.previous) * 100 : 0;

  return {
    title: modes[mode] || modes["month-month"],
    first: primary.title,
    second: secondary.title,
    diff,
    percent: Number(percent.toFixed(1)),
    trend: percent >= 0 ? "up" : "down",
    ai: percent >= 0
      ? "Taqqoslash ijobiy: growth asosan revenue va mijoz faolligidan kelmoqda."
      : "Taqqoslash ogohlantiradi: xarajat yoki supply chain bosimi natijani pasaytiryapti.",
  };
};

export const getSearchIntent = (query) => {
  const value = normalizeSearch(query);
  if (!value) return null;

  const cases = [
    { keys: ["bugungi savdo", "today sales"], report: "sales", filters: { datePreset: "today" } },
    { keys: ["yanvar xarajat", "expenses", "xarajat"], report: "finance", filters: { datePreset: "month" } },
    { keys: ["eng foydali", "profit", "foyda"], report: "profit", filters: { priority: "high" } },
    { keys: ["kam sotilgan", "dead stock", "low stock"], report: "inventory", filters: { risk: "high" } },
    { keys: ["qarzdor supplier", "qarzdor yetkazib", "supplier", "yetkazib beruvchi"], report: "purchases", filters: { status: "warning" } },
    { keys: ["top 10 mijoz", "top customer", "mijoz"], report: "crm", filters: { customer: "VIP" } },
    { keys: ["oxirgi 30 kun", "last 30"], report: "dashboard", filters: { datePreset: "last30" } },
    { keys: ["revenue", "daromad", "daromad prognozi"], report: "sales", filters: { priority: "high" } },
    { keys: ["hr", "hodim", "xodim", "employee"], report: "hr", filters: { department: "HR" } },
  ];

  return cases.find((item) => item.keys.some((key) => value.includes(key))) || {
    report: "dashboard",
    filters: {},
  };
};

export const drillPath = ["Revenue", "Year", "Month", "Week", "Day", "Transaction", "Invoice"];
