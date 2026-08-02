import { configureStore } from "@reduxjs/toolkit";

import businessOSReducer from "../../core/businessOS/businessOSSlice";
import { businessPersistenceMiddleware } from "../../core/businessOS/businessMiddleware";
import authReducer from "../../features/auth/authSlice";
import { baseApi } from "../../shared/services/api";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    businessOS: businessOSReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware, businessPersistenceMiddleware),
  devTools: import.meta.env.DEV,
});
