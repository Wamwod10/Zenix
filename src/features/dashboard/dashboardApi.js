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
      query: ({ period = "today", branchId = "all", warehouseId = "all", currency } = {}) => ({
        url: "/dashboard/summary",
        params: {
          period,
          branchId: branchId === "all" ? undefined : branchId,
          warehouseId: warehouseId === "all" ? undefined : warehouseId,
          currency,
          allBranches: branchId === "all" ? true : undefined,
        },
      }),
      transformResponse: normalizeDashboardSummary,
      providesTags: ["DashboardSummary"],
    }),
  }),
});

export const { useDashboardSummaryQuery } = dashboardApi;

export function formatMoney(amount, currency = "uzs") {
  if (amount == null || amount === "") return "Ma'lumot yo'q";

  const value = Number(amount);
  if (!Number.isFinite(value)) return "Hisoblash xatosi";

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
  if (amount == null || amount === "") return "Ma'lumot yo'q";

  const value = Number(amount);
  if (!Number.isFinite(value)) return "Hisoblash xatosi";

  return new Intl.NumberFormat("uz-UZ").format(value);
}

export function formatCompactMoney(amount, currency = "uzs") {
  if (amount == null || amount === "") return "Ma'lumot yo'q";

  const value = Number(amount);
  if (!Number.isFinite(value)) return "Hisoblash xatosi";

  const absValue = Math.abs(value);
  const suffix =
    absValue >= 1_000_000_000
      ? { divider: 1_000_000_000, label: "mlrd" }
      : absValue >= 1_000_000
        ? { divider: 1_000_000, label: "mln" }
        : absValue >= 1_000
          ? { divider: 1_000, label: "ming" }
          : null;

  if (!suffix) return formatMoney(value, currency);

  const compact = new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: absValue / suffix.divider >= 10 ? 0 : 1,
  }).format(value / suffix.divider);

  return `${compact} ${suffix.label} ${String(currency || "UZS").toUpperCase()}`;
}

export function formatPercentChange(current, previous, positiveDown = false) {
  const currentValue = Number(current);
  const previousValue = Number(previous);

  if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue)) {
    return null;
  }

  if (!previousValue) {
    if (!currentValue) return null;

    return {
      label: `0 dan ${formatNumber(currentValue)} ga oshdi`,
      trend: positiveDown ? "down" : "up",
    };
  }

  const value = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  const isPositive = positiveDown ? value <= 0 : value >= 0;

  return {
    label: `${value > 0 ? "+" : ""}${value.toFixed(Math.abs(value) >= 10 ? 0 : 1)}%`,
    trend: isPositive ? "up" : "down",
  };
}
