// ✅ BACKEND INTEGRATION: dashboard endpointi (RTK Query)
// GET /dashboard/summary - real jamoa, faoliyat oqimi, kompaniya ma'lumotlari.
// Savdo statlari POS savdolari yig'ilgach avtomatik to'ladi.

import { baseApi } from "../../shared/services/api";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    dashboardSummary: builder.query({
      query: () => "/dashboard/summary",
      transformResponse: (res) => res.data,
    }),
  }),
});

export const { useDashboardSummaryQuery } = dashboardApi;

// Valyuta formatlash: 14280000 -> "14 280 000 so'm"
export function formatMoney(amount, currency = "uzs") {
  const formatted = Number(amount ?? 0).toLocaleString("ru-RU");
  const label = currency === "uzs" ? "so'm" : currency.toUpperCase();
  return `${formatted} ${label}`;
}
