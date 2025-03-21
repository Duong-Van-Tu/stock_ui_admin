import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';

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
          state.stockScoresData = action.payload.result.map((stock: any) => ({
            id: stock.id,
            symbol: stock.symbol,
            companyName: stock.companyname,
            earningDate: stock.earning_date,
            isAdd: stock.isadd,
            isAddWatchList: stock.isaddwl,
            isNews: stock.isnews,
            totalScore: stock.totalscore,
            fundamentalScore: stock.fund_score,
            sentimentScore: stock.estimate_score,
            earningsScore: stock.earnings_score,
            ytd: stock.perf_ytd_value,
            dayChangePercent: stock.daychangepercent,
            price: stock.price,
            volume: stock.volume,
            beta: stock.beta,
            atr: stock.atr
          }));
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
