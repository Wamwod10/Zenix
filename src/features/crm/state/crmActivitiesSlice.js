import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activities: [],
  loading: false,
};

export const crmActivitiesSlice = createSlice({
  name: 'crmActivities',
  initialState,
  reducers: {
    setActivities: (state, action) => {
      state.activities = action.payload;
    },
  },
});

export default crmActivitiesSlice.reducer;
