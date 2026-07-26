import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filters: {},
};

export const crmFiltersSlice = createSlice({
  name: 'crmFilters',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export default crmFiltersSlice.reducer;
