import { baseApi, unwrapApiResponse } from "../../shared/services/api";

const unwrapItems = (response) => {
  const data = unwrapApiResponse(response);
  return data?.items ?? data ?? [];
};

export const posApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    posProducts: builder.query({
      query: () => "/pos/products?limit=200&sortBy=name&sortOrder=asc",
      transformResponse: unwrapItems,
      providesTags: ["POS"],
    }),
    posCategories: builder.query({
      query: () => "/pos/categories",
      transformResponse: unwrapApiResponse,
      providesTags: ["POS"],
    }),
    posCustomers: builder.query({
      query: () => "/pos/customers?limit=100&sortBy=name&sortOrder=asc",
      transformResponse: unwrapItems,
      providesTags: ["POS"],
    }),
  }),
});

export const {
  usePosProductsQuery,
  usePosCategoriesQuery,
  usePosCustomersQuery,
} = posApi;
