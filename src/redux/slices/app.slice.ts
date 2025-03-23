import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AppSliceState {
  sideBarCollapsed: boolean;
}

const initialState: AppSliceState = {
  sideBarCollapsed: false
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: (create) => ({
    setSideBarCollapsed: create.reducer(
      (state, action: PayloadAction<boolean>) => {
        state.sideBarCollapsed = action.payload;
      }
    )
  }),
  selectors: {
    watchSideBarCollapsed: (app) => app.sideBarCollapsed
  }
});

// Action creators are generated for each case reducer function.
export const { setSideBarCollapsed } = appSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { watchSideBarCollapsed } = appSlice.selectors;
