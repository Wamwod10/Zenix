import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../../shared/services/api";

const rootReducer = (state = {}) => state;

export const store = configureStore({
  reducer: {
    app: rootReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),

  devTools: import.meta.env.DEV,
});
