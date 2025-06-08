import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { transformWatchlist50Days } from '@/helpers/swing-trading-watchlist.helper';
import { convertParamsByMapping } from '@/utils/common';
import { AppThunk } from '../store';
import { PayloadAction } from '@reduxjs/toolkit';

export type SwingTradingWatchlistState = {
  loading: boolean;
  pagination: Pagination;
  watchlistIn50Days: WatchlistIn50Days[];
};

const initialState: SwingTradingWatchlistState = {
  loading: false,
  watchlistIn50Days: [],
  pagination: PAGINATION
};

export const swingTradingWatchlistSlice = createAppSlice({
  name: 'swing-trading-watchlist',
  initialState,
  reducers: (create) => ({
    getWatchlistIn50Days: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          'tickers/get-swing-trading-watchlist',
          {
            query: query ? convertParamsByMapping(query) : {}
          }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.watchlistIn50Days = transformWatchlist50Days(
            action.payload.result
          );
          state.pagination = {
            currentPage: action.payload.offset,
            pageSize: action.payload.limit,
            total: Number(action.payload.total)
          };
        },
        rejected: (state) => {
          state.loading = false;
          state.watchlistIn50Days = [];
          state.pagination = PAGINATION;
        }
      }
    ),
    updateWatchlistIn50Days: create.reducer(
      (state, action: PayloadAction<any>) => {
        state.watchlistIn50Days = transformWatchlist50Days(
          action.payload.result
        );
        state.pagination = {
          currentPage: action.payload.offset,
          pageSize: action.payload.limit,
          total: Number(action.payload.total)
        };
      }
    ),
    resetState: create.reducer((state) => {
      Object.assign(state, initialState);
    })
  }),

  selectors: {
    watchWatchlistIn50DaysLoading: (state) => state.loading,
    watchWatchlistIn50Days: (state) => state.watchlistIn50Days,
    watchWatchlistIn50DaysPagination: (state) => state.pagination
  }
});

export const {
  watchWatchlistIn50DaysLoading,
  watchWatchlistIn50Days,
  watchWatchlistIn50DaysPagination
} = swingTradingWatchlistSlice.selectors;

export const { getWatchlistIn50Days, resetState, updateWatchlistIn50Days } =
  swingTradingWatchlistSlice.actions;

export const autoUpdateWatchlistIn50days =
  (query?: Record<string, any>): AppThunk =>
  async (dispatch) => {
    const response = await defaultApiFetcher.get(
      'tickers/get-swing-trading-watchlist',
      {
        query: query ? convertParamsByMapping(query) : {}
      }
    );
    dispatch(updateWatchlistIn50Days(response.data));
  };
