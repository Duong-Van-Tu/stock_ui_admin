import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SearchSliceState {
  symbol: string;
}

const initialState: SearchSliceState = {
  symbol: ''
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: (create) => ({
    searchSymbol: create.reducer((state, action: PayloadAction<string>) => {
      state.symbol = action.payload;
    })
  }),
  selectors: {
    watchSearchSymbol: (search) => search.symbol
  }
});

export const { searchSymbol } = searchSlice.actions;

export const { watchSearchSymbol } = searchSlice.selectors;
