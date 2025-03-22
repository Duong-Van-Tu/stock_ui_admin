import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { transformStockData } from '@/helpers/stock-core.helper';

export type StockScoreState = {
  loading: boolean;
  pagination: Pagination;
  stockScoresData: StockScore[];
};

const initialState: StockScoreState = {
  loading: false,
  pagination: PAGINATION,
  stockScoresData: []
};

export const stockScoreSlice = createAppSlice({
  name: 'stock-score',
  initialState,
  reducers: (create) => ({
    getStockScore: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get('stock-scores', {
          query
        });
        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.stockScoresData = transformStockData(action.payload.result);
          state.pagination = {
            currentPage: action.payload.offset,
            pageSize: action.payload.limit,
            total: Number(action.payload.total)
          };
        },
        rejected: (state) => {
          state.loading = true;
          state.stockScoresData = [];
          state.pagination = PAGINATION;
        }
      }
    )
  }),

  selectors: {
    watchStockScoreLoading: (stockScore) => stockScore.loading,
    watchStockScoreData: (stockScore) => stockScore.stockScoresData,
    watchStockScorePagination: (stockScore) => stockScore.pagination
  }
});

export const {
  watchStockScoreLoading,
  watchStockScoreData,
  watchStockScorePagination
} = stockScoreSlice.selectors;

export const { getStockScore } = stockScoreSlice.actions;
