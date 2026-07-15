import { baseApi, tokenStorage, unwrapApiResponse } from "../../shared/services/api";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      transformResponse: unwrapApiResponse,
    }),
    verifyEmail: builder.mutation({
      query: (body) => ({
        url: "/auth/verify-email",
        method: "POST",
        body,
      }),
      transformResponse: (response) => {
        const data = unwrapApiResponse(response);
        tokenStorage.setTokens(data?.tokens);
        return data;
      },
      invalidatesTags: ["Auth", "Dashboard", "POS"],
    }),
    resendCode: builder.mutation({
      query: (body) => ({
        url: "/auth/resend-code",
        method: "POST",
        body,
      }),
      transformResponse: unwrapApiResponse,
    }),
    login: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response) => {
        const data = unwrapApiResponse(response);
        tokenStorage.setTokens(data?.tokens);
        return data;
      },
      invalidatesTags: ["Auth", "Dashboard", "POS"],
    }),
    me: builder.query({
      query: () => "/auth/me",
      transformResponse: unwrapApiResponse,
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendCodeMutation,
  useLoginMutation,
  useMeQuery,
} = authApi;
