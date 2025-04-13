import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  transformFundamentalDetailScore,
  transformFundamentalScore,
  transformStockDetails
} from '@/helpers/stock-details.helper';

export type StockDetailsState = {
  loading: boolean;
  stockDetails: StockDetails | null;
  fundamentalDetailLoading: boolean;
  fundamentalDetails: FundamentalDetails[];
  fundamentalScoreLoading: boolean;
  fundamentalScore: FundamentalScore;
  fundamentalDetailScoreLoading: boolean;
  fundamentalDetailScore: FundamentalDetailScore[];
};

const initFundamentalScore = {
  ebitScore: 0,
  grossIncomeScore: 0,
  netIncomeScore: 0,
  revenueScore: 0,
  detailFundamentalScore: 0
};

const initialState: StockDetailsState = {
  loading: false,
  fundamentalDetailLoading: false,
  stockDetails: null,
  fundamentalScoreLoading: false,
  fundamentalScore: {
    ebitScore: 0,
    grossIncomeScore: 0,
    netIncomeScore: 0,
    revenueScore: 0,
    detailFundamentalScore: 0
  },
  fundamentalDetails: [],
  fundamentalDetailScoreLoading: false,
  fundamentalDetailScore: []
};

export const stockDetailsSlice = createAppSlice({
  name: 'stock-details',
  initialState,
  reducers: (create) => ({
    getStockDetails: create.asyncThunk(
      async (symbol: string) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/detail/${symbol}`
        );
        return response.data[0];
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.stockDetails = transformStockDetails(action.payload);
        },
        rejected: (state) => {
          state.loading = false;
          state.stockDetails = null;
        }
      }
    ),
    getFundamentalDetails: create.asyncThunk(
      async (symbol: string) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/fundamental-detail/${symbol}`
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.fundamentalDetailLoading = true;
        },
        fulfilled: (state, action) => {
          state.fundamentalDetailLoading = false;
          state.fundamentalDetails = action.payload;
        },
        rejected: (state) => {
          state.fundamentalDetailLoading = false;
          state.fundamentalDetails = [];
        }
      }
    ),
    getFundamentalScore: create.asyncThunk(
      async (symbol: string) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/fundamental-score/${symbol}`
        );
        return response.data[0];
      },
      {
        pending: (state) => {
          state.fundamentalDetailLoading = true;
        },
        fulfilled: (state, action) => {
          state.fundamentalDetailLoading = false;
          state.fundamentalScore = transformFundamentalScore(action.payload);
        },
        rejected: (state) => {
          state.fundamentalDetailLoading = false;
          state.fundamentalScore = initFundamentalScore;
        }
      }
    ),
    getFundamentalDetailScore: create.asyncThunk(
      async (symbol: string) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/fundamental-score-detail/${symbol}`
        );

        return response.data;
      },
      {
        pending: (state) => {
          state.fundamentalDetailScoreLoading = true;
        },
        fulfilled: (state, action) => {
          state.fundamentalDetailScoreLoading = false;
          state.fundamentalDetailScore = transformFundamentalDetailScore(
            action.payload
          );
        },
        rejected: (state) => {
          state.fundamentalDetailScoreLoading = false;
          state.fundamentalDetailScore = [];
        }
      }
    )
  }),

  selectors: {
    watchStockDetailsLoading: (stock) => stock.loading,
    watchStockDetails: (stock) => stock.stockDetails,
    watchFundamentalDetailLoading: (stock) => stock.fundamentalDetailLoading,
    watchFundamentalDetails: (stock) => stock.fundamentalDetails,
    watchFundamentalScoreLoading: (stock) => stock.fundamentalScoreLoading,
    watchFundamentalScore: (stock) => stock.fundamentalScore,
    watchFundamentalDetailScoreLoading: (stock) =>
      stock.fundamentalDetailScoreLoading,
    watchFundamentalDetailScore: (stock) => stock.fundamentalDetailScore
  }
});

export const {
  watchStockDetailsLoading,
  watchStockDetails,
  watchFundamentalDetailLoading,
  watchFundamentalDetails,
  watchFundamentalScoreLoading,
  watchFundamentalScore,
  watchFundamentalDetailScoreLoading,
  watchFundamentalDetailScore
} = stockDetailsSlice.selectors;

export const {
  getStockDetails,
  getFundamentalDetails,
  getFundamentalScore,
  getFundamentalDetailScore
} = stockDetailsSlice.actions;
