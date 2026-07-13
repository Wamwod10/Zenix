// ✅ BACKEND INTEGRATION: RTK Query bazaviy API
// - Har so'rovga Authorization: Bearer <token> qo'shadi
// - 401 kelsa refresh token bilan yangi access oladi va so'rovni takrorlaydi
// - Refresh ham ishlamasa -> logout + /login ga yo'naltiradi

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../config/env";
import { tokenStorage } from "./storage";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = tokenStorage.getAccess();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// Bir vaqtda faqat bitta refresh so'rovi ketishi uchun
let refreshPromise = null;

async function baseQueryWithReauth(args, api, extraOptions) {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = tokenStorage.getRefresh();

    if (!refreshToken) {
      tokenStorage.clear();
      return result;
    }

    if (!refreshPromise) {
      refreshPromise = rawBaseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extraOptions,
      ).finally(() => {
        refreshPromise = null;
      });
    }

    const refreshResult = await refreshPromise;

    if (refreshResult?.data?.data?.tokens) {
      tokenStorage.save({ tokens: refreshResult.data.data.tokens });
      // Asl so'rovni yangi token bilan takrorlaymiz
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      tokenStorage.clear();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }

  return result;
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Me",
    "PosCategories",
    "PosProducts",
    "PosCustomers",
    "PosSales",
    "PosHeld",
    "PosShift",
    "PosSettings",
    "PosPermissions",
  ],
  endpoints: () => ({}),
});

// Backend xato formati: { success:false, error:{ code, message } }
// Bu helper komponentlarda xabarni oson olish uchun
export function getApiError(err) {
  return {
    code: err?.data?.error?.code ?? "NETWORK_ERROR",
    message:
      err?.data?.error?.message ??
      "Server bilan aloqa yo'q. Backend ishlayotganini tekshiring.",
  };
}
