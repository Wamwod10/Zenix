import { baseApi } from "../../shared/services/api";

const unwrapData = (response) => response?.data ?? response ?? [];

export const posApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    posProducts: builder.query({
      query: () => "/pos/products",
      transformResponse: unwrapData,
      providesTags: ["PosProducts"],
    }),
    posCategories: builder.query({
      query: () => "/pos/categories",
      transformResponse: unwrapData,
      providesTags: ["PosCategories"],
    }),
    posCustomers: builder.query({
      query: () => "/pos/customers",
      transformResponse: unwrapData,
      providesTags: ["PosCustomers"],
    }),
  }),
});

export const {
  usePosProductsQuery,
  usePosCategoriesQuery,
  usePosCustomersQuery,
} = posApi;
