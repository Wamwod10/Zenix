// ✅ BACKEND INTEGRATION: auth holati (user + tokenlar)
// Sahifa yangilanganda localStorage'dan tiklanadi

import { createSlice } from "@reduxjs/toolkit";
import { tokenStorage } from "../../shared/services/storage";

const initialState = {
  user: tokenStorage.getUser(),
  isAuthenticated: Boolean(tokenStorage.getAccess()),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login yoki email tasdiqlashdan keyin chaqiriladi
    setCredentials: (state, action) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      tokenStorage.save({ user, tokens });
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      tokenStorage.clear();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export default authSlice.reducer;
