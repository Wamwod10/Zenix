import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000/api/v1";

export const tokenStorage = {
  getAccessToken() {
    return localStorage.getItem("zenix_access_token");
  },
  getRefreshToken() {
    return localStorage.getItem("zenix_refresh_token");
  },
  setTokens(tokens) {
    if (!tokens) {
      return;
    }

    localStorage.setItem("zenix_access_token", tokens.accessToken);
    localStorage.setItem("zenix_refresh_token", tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem("zenix_access_token");
    localStorage.removeItem("zenix_refresh_token");
  },
};

export function unwrapApiResponse(response) {
  return response?.data ?? response;
}

export function getApiErrorMessage(error, fallback = "So'rov bajarilmadi.") {
  return (
    error?.data?.error?.message ||
    error?.data?.message ||
    error?.error ||
    fallback
  );
}

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = tokenStorage.getAccessToken();

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Auth", "Dashboard", "POS"],
  endpoints: () => ({}),
});
