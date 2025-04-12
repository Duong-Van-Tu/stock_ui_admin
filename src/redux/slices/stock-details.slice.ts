import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  transformFundamentalScore,
  transformStockDetails
} from '@/helpers/stock-details.helper';

export type StockDetailsState = {
  loading: boolean;
  fundamentalDetailLoading: boolean;
  fundamentalDetails: FundamentalDetails[];
  fundamentalScoreLoading: boolean;
  fundamentalScore: FundamentalScore;
  stockDetails: StockDetails | null;
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
  fundamentalDetails: []
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
          state.loading = false;
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
          state.loading = false;
          state.fundamentalScore = initFundamentalScore;
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
    watchFundamentalScore: (stock) => stock.fundamentalScore
  }
});

export const {
  watchStockDetailsLoading,
  watchStockDetails,
  watchFundamentalDetailLoading,
  watchFundamentalDetails,
  watchFundamentalScoreLoading,
  watchFundamentalScore
} = stockDetailsSlice.selectors;

export const { getStockDetails, getFundamentalDetails, getFundamentalScore } =
  stockDetailsSlice.actions;
