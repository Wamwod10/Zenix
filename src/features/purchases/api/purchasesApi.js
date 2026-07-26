// ✅ BACKEND INTEGRATION: Xaridlar moduli RTK Query endpointlari.
// Endpointlar PDF dagi API logikasi bo'yicha; backend tayyor bo'lganda
// hooks/usePurchasesStore.js dagi lokal fallback o'chiriladi.

import { baseApi } from "../../../shared/services/api";

const unwrapData = (response) => response?.data ?? response ?? [];

export const purchasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // PDF 1: GET /purchases/dashboard?period=month
    purchaseDashboard: builder.query({
      query: (period = "month") => `/purchases/dashboard?period=${period}`,
      transformResponse: unwrapData,
      providesTags: ["PurchaseDashboard"],
    }),

    // PDF 2: GET /purchase-orders?status=&supplier=&page=
    purchaseOrders: builder.query({
      query: (params = {}) => ({ url: "/purchase-orders", params }),
      transformResponse: unwrapData,
      providesTags: ["PurchaseOrders"],
    }),

    purchaseOrder: builder.query({
      query: (id) => `/purchase-orders/${id}`,
      transformResponse: unwrapData,
      providesTags: (result, error, id) => [{ type: "PurchaseOrders", id }],
    }),

    // PDF 4: POST /purchase-orders
    createPurchaseOrder: builder.mutation({
      query: (body) => ({ url: "/purchase-orders", method: "POST", body }),
      invalidatesTags: ["PurchaseOrders", "PurchaseDashboard"],
    }),

    // PDF 3: POST /purchase-orders/draft, PATCH /draft/{id}
    savePurchaseDraft: builder.mutation({
      query: ({ id, ...body }) => ({
        url: id ? `/purchase-orders/draft/${id}` : "/purchase-orders/draft",
        method: id ? "PATCH" : "POST",
        body,
      }),
      invalidatesTags: ["PurchaseOrders"],
    }),

    // PDF 5: POST /po/{id}/approve, /reject
    approvePurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/${id}/approve`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseOrders", "PurchaseDashboard"],
    }),

    rejectPurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseOrders"],
    }),

    // PDF 18: PATCH /po/{id}/status
    updatePurchaseOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/purchase-orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["PurchaseOrders", "PurchaseDashboard"],
    }),

    // PDF 21-25: POST /po/{id}/receive
    receivePurchaseOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/${id}/receive`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseOrders", "GoodsReceipts", "PurchaseDashboard"],
    }),

    // PDF 40: GET /goods-receipts?filter=
    goodsReceipts: builder.query({
      query: (params = {}) => ({ url: "/goods-receipts", params }),
      transformResponse: unwrapData,
      providesTags: ["GoodsReceipts"],
    }),

    // PDF 36-37: POST /purchase-returns, /{id}/approve
    purchaseReturns: builder.query({
      query: (params = {}) => ({ url: "/purchase-returns", params }),
      transformResponse: unwrapData,
      providesTags: ["PurchaseReturns"],
    }),

    createPurchaseReturn: builder.mutation({
      query: (body) => ({ url: "/purchase-returns", method: "POST", body }),
      invalidatesTags: ["PurchaseReturns", "PurchaseOrders"],
    }),

    // PDF 41-46: invoices + payments
    purchaseInvoices: builder.query({
      query: (params = {}) => ({ url: "/purchase-invoices", params }),
      transformResponse: unwrapData,
      providesTags: ["PurchaseInvoices"],
    }),

    createPurchaseInvoice: builder.mutation({
      query: (body) => ({ url: "/purchase-invoices", method: "POST", body }),
      invalidatesTags: ["PurchaseInvoices", "PurchaseOrders"],
    }),

    payPurchaseInvoice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-invoices/${id}/pay`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseInvoices", "PurchaseOrders", "PurchaseDashboard"],
    }),

    // PDF 6: GET /suppliers?product=&sort=score
    purchaseSuppliers: builder.query({
      query: (params = {}) => ({ url: "/suppliers", params }),
      transformResponse: unwrapData,
      providesTags: ["PurchaseSuppliers"],
    }),
  }),
});

export const {
  usePurchaseDashboardQuery,
  usePurchaseOrdersQuery,
  usePurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useSavePurchaseDraftMutation,
  useApprovePurchaseOrderMutation,
  useRejectPurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
  useReceivePurchaseOrderMutation,
  useGoodsReceiptsQuery,
  usePurchaseReturnsQuery,
  useCreatePurchaseReturnMutation,
  usePurchaseInvoicesQuery,
  useCreatePurchaseInvoiceMutation,
  usePayPurchaseInvoiceMutation,
  usePurchaseSuppliersQuery,
} = purchasesApi;
