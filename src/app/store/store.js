import { configureStore } from "@reduxjs/toolkit";
// ✅ BACKEND INTEGRATION: API va auth reducer'lar qo'shildi
import { baseApi } from "../../shared/services/api";
import authReducer from "../../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer, // RTK Query cache
    auth: authReducer, // user + isAuthenticated
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware), // ✅ BACKEND INTEGRATION: RTK Query middleware

  devTools: import.meta.env.DEV,
});
