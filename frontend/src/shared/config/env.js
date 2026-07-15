// ✅ BACKEND INTEGRATION: API manzili shu yerda
// Production'da .env faylga VITE_API_URL qo'yiladi
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";
