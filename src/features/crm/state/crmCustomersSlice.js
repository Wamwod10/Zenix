import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customers: [],
  loading: false,
  error: null,
};

export const crmCustomersSlice = createSlice({
  name: 'crmCustomers',
  initialState,
  reducers: {
    setCustomers: (state, action) => {
      state.customers = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export default crmCustomersSlice.reducer;
