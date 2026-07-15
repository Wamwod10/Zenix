// ✅ BACKEND INTEGRATION: auth endpointlari (RTK Query)
// Backend: NestJS, http://localhost:4000/api/v1/auth/*
// Barcha javoblar { success:true, data:{...} } formatida keladi -
// transformResponse orqali faqat data qismini olamiz.

import { baseApi } from "../../shared/services/api";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Register.jsx maydonlari bilan 1:1: {company, owner, email, phone, password}
    register: builder.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: (res) => res.data,
    }),

    // EmailVerification.jsx: {email, code} -> {user, tokens}
    verifyEmail: builder.mutation({
      query: (body) => ({ url: "/auth/verify-email", method: "POST", body }),
      transformResponse: (res) => res.data,
    }),

    // 60s cooldown backend'da ham bor (RESEND_COOLDOWN xatosi)
    resendCode: builder.mutation({
      query: (body) => ({ url: "/auth/resend-code", method: "POST", body }),
      transformResponse: (res) => res.data,
    }),

    // Login.jsx: {email, password} -> {user, tokens}
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (res) => res.data,
    }),

    logout: builder.mutation({
      query: (body) => ({ url: "/auth/logout", method: "POST", body }),
      transformResponse: (res) => res.data,
    }),

    me: builder.query({
      query: () => "/auth/me",
      transformResponse: (res) => res.data,
      providesTags: ["Me"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendCodeMutation,
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
} = authApi;
