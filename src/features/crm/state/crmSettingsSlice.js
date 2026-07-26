import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  settings: {},
};

export const crmSettingsSlice = createSlice({
  name: 'crmSettings',
  initialState,
  reducers: {
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

export default crmSettingsSlice.reducer;
