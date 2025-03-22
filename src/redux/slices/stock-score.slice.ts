import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { transformStockData } from '@/helpers/stock-core.helper';

export type StockScoreState = {
  loading: boolean;
  pagination: Pagination;
  stockScoresData: StockScore[];
  industryLoading: boolean;
  industries?: { industry: string }[];
  sectorLoading: boolean;
  sectors?: { sector: string }[];
};

const initialState: StockScoreState = {
  loading: false,
  industryLoading: false,
  sectorLoading: false,
  stockScoresData: [],
  industries: [],
  sectors: [],
  pagination: PAGINATION
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
          state.loading = false;
          state.stockScoresData = [];
          state.pagination = PAGINATION;
        }
      }
    ),
    getIndustries: create.asyncThunk(
      async () => {
        const response = await defaultApiFetcher.get(
          'tickers-profile/get-industry'
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.industryLoading = true;
        },
        fulfilled: (state, action) => {
          state.industryLoading = false;
          state.industries = action.payload;
        },
        rejected: (state) => {
          state.industryLoading = false;
        }
      }
    ),
    getSectors: create.asyncThunk(
      async () => {
        const response = await defaultApiFetcher.get(
          'tickers-profile/get-sector'
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.sectorLoading = true;
        },
        fulfilled: (state, action) => {
          state.sectorLoading = false;
          state.sectors = action.payload;
        },
        rejected: (state) => {
          state.sectorLoading = false;
        }
      }
    )
  }),

  selectors: {
    watchStockScoreLoading: (stockScore) => stockScore.loading,
    watchStockScoreData: (stockScore) => stockScore.stockScoresData,
    watchStockScorePagination: (stockScore) => stockScore.pagination,
    watchIndustriesLoading: (industry) => industry.industryLoading,
    watchIndustries: (industry) => industry.industries,
    watchSectorLoading: (sector) => sector.sectorLoading,
    watchSectors: (sector) => sector.sectors
  }
});

export const {
  watchStockScoreLoading,
  watchStockScoreData,
  watchStockScorePagination,
  watchIndustries,
  watchIndustriesLoading,
  watchSectors,
  watchSectorLoading
} = stockScoreSlice.selectors;

export const { getStockScore, getIndustries, getSectors } =
  stockScoreSlice.actions;
