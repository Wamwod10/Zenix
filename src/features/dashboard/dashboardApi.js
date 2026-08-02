import { baseApi } from "../../shared/services/api";

const EMPTY_SUMMARY = {
  user: null,
  tenant: null,
  stats: {},
  topProducts: [],
  activity: [],
  employees: null,
};

const normalizeDashboardSummary = (res) => {
  const payload = res?.data ?? res ?? {};

  return {
    ...EMPTY_SUMMARY,
    ...payload,
    stats: payload.stats ?? {},
    topProducts: Array.isArray(payload.topProducts) ? payload.topProducts : [],
    activity: Array.isArray(payload.activity) ? payload.activity : [],
    employees: payload.employees ?? null,
    meta: {
      ...(payload.meta ?? {}),
      fetchedAt: payload.meta?.fetchedAt ?? new Date().toISOString(),
    },
  };
};

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    dashboardSummary: builder.query({
      query: () => "/dashboard/summary",
      transformResponse: normalizeDashboardSummary,
    }),
  }),
});

export const { useDashboardSummaryQuery } = dashboardApi;

export function formatMoney(amount, currency = "uzs") {
  const value = Number(amount ?? 0);
  const currencyCode = String(currency || "UZS").toUpperCase();

  try {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${new Intl.NumberFormat("uz-UZ").format(value)} ${currencyCode}`;
  }
}

export function formatNumber(amount) {
  return new Intl.NumberFormat("uz-UZ").format(Number(amount ?? 0));
}

export function formatPercentChange(current, previous, positiveDown = false) {
  const currentValue = Number(current ?? 0);
  const previousValue = Number(previous ?? 0);

  if (!previousValue || Number.isNaN(currentValue) || Number.isNaN(previousValue)) {
    return null;
  }

  const value = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  const isPositive = positiveDown ? value <= 0 : value >= 0;

  return {
    label: `${value > 0 ? "+" : ""}${value.toFixed(Math.abs(value) >= 10 ? 0 : 1)}%`,
    trend: isPositive ? "up" : "down",
  };
}
