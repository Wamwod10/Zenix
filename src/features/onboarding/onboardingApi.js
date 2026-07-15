// ✅ BACKEND INTEGRATION: onboarding endpointlari (RTK Query)
// Barcha endpointlar JWT talab qiladi - token avtomatik qo'shiladi (api.js).
// Qadamlar: business_type -> business_setup -> pricing -> payment -> completed

import { baseApi } from "../../shared/services/api";

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Sahifa refresh bo'lsa qaysi qadamda ekanini bilish uchun
    onboardingState: builder.query({
      query: () => "/onboarding/state",
      transformResponse: (res) => res.data,
    }),

    // BusinessType.jsx: {businessType: "retail" | "food" | ...}
    setBusinessType: builder.mutation({
      query: (body) => ({
        url: "/onboarding/business-type",
        method: "PATCH",
        body,
      }),
      transformResponse: (res) => res.data,
    }),

    // BusinessSetup.jsx: {companyName, industry, country, city, address, phone, currency, taxId?}
    setBusinessSetup: builder.mutation({
      query: (body) => ({
        url: "/onboarding/business-setup",
        method: "PATCH",
        body,
      }),
      transformResponse: (res) => res.data,
    }),

    // Pricing.jsx: {plan: "free" | "starter" | "pro" | "business"}
    // Backend 14 kunlik trial muddatini o'rnatadi
    selectPlan: builder.mutation({
      query: (body) => ({ url: "/onboarding/plan", method: "PATCH", body }),
      transformResponse: (res) => res.data,
    }),

    // PaymentCard.jsx: {cardNumber, holder, expiry, cvc?, country}
    // Backend faqat brand + oxirgi 4 raqamni saqlaydi (xavfsizlik)
    savePaymentCard: builder.mutation({
      query: (body) => ({
        url: "/onboarding/payment-card",
        method: "POST",
        body,
      }),
      transformResponse: (res) => res.data,
    }),
  }),
});

export const {
  useOnboardingStateQuery,
  useSetBusinessTypeMutation,
  useSetBusinessSetupMutation,
  useSelectPlanMutation,
  useSavePaymentCardMutation,
} = onboardingApi;
