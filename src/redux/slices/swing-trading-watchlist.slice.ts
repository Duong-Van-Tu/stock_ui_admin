import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  transformHistoryWatchlistSwingTrade,
  transformWatchlistSwingTrade
} from '@/helpers/swing-trading-watchlist.helper';
import { convertParamsByMapping } from '@/utils/common';

export type SwingTradingWatchlistState = {
  loading: boolean;
  pagination: Pagination;
  watchlistSwingTrade: WatchlistSwingTrade[];
  historyWatchlistSwingTrade: HistoryWatchlistSwingTrade[];
};

const initialState: SwingTradingWatchlistState = {
  loading: false,
  watchlistSwingTrade: [],
  historyWatchlistSwingTrade: [],
  pagination: PAGINATION
};

export const swingTradingWatchlistSlice = createAppSlice({
  name: 'swing-trading-watchlist',
  initialState,
  reducers: (create) => ({
    getWatchlistSwingTrade: create.asyncThunk(
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
          state.watchlistSwingTrade = transformWatchlistSwingTrade(
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
          state.watchlistSwingTrade = [];
          state.pagination = PAGINATION;
        }
      }
    ),
    getHistoryWatchlistSwingTrade: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          'tickers/get-swing-trading-watchlist-page',
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
          state.historyWatchlistSwingTrade =
            transformHistoryWatchlistSwingTrade(action.payload.result);
          state.pagination = {
            currentPage: action.payload.offset,
            pageSize: action.payload.limit,
            total: Number(action.payload.total)
          };
        },
        rejected: (state) => {
          state.loading = false;
          state.watchlistSwingTrade = [];
          state.pagination = PAGINATION;
        }
      }
    ),
    resetState: create.reducer((state) => {
      Object.assign(state, initialState);
    })
  }),

  selectors: {
    watchWatchlistSwingTradeLoading: (state) => state.loading,
    watchWatchlistSwingTrade: (state) => state.watchlistSwingTrade,
    watchHistoryWatchlistSwingTrade: (state) =>
      state.historyWatchlistSwingTrade,
    watchWatchlistSwingTradePagination: (state) => state.pagination
  }
});

export const {
  watchWatchlistSwingTradeLoading,
  watchWatchlistSwingTrade,
  watchHistoryWatchlistSwingTrade,
  watchWatchlistSwingTradePagination
} = swingTradingWatchlistSlice.selectors;

export const {
  getWatchlistSwingTrade,
  resetState,
  getHistoryWatchlistSwingTrade
} = swingTradingWatchlistSlice.actions;
