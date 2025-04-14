import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  transformFundamentalDetailScore,
  transformFundamentalScore,
  transformMovingSentimentScore,
  transformSentimentScore,
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
  sentimentScoreLoading: boolean;
  sentimentScore: SentimentScore;
  movingSentimentScoreLoading: boolean;
  movingSentimentScore: MovingSentimentScore[];
};

const initFundamentalScore = {
  ebitScore: 0,
  grossIncomeScore: 0,
  netIncomeScore: 0,
  revenueScore: 0,
  detailFundamentalScore: 0
};

const initSentimentScore = {
  score1w: 0,
  score1m: 0,
  score3m: 0
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
  fundamentalDetailScore: [],
  sentimentScoreLoading: false,
  sentimentScore: initSentimentScore,
  movingSentimentScoreLoading: false,
  movingSentimentScore: []
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
    ),
    getSentimentScore: create.asyncThunk(
      async (symbol: string) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/sentiment-score/${symbol}`
        );
        return response.data[0];
      },
      {
        pending: (state) => {
          state.sentimentScoreLoading = true;
        },
        fulfilled: (state, action) => {
          state.sentimentScoreLoading = false;
          state.sentimentScore = transformSentimentScore(action.payload);
        },
        rejected: (state) => {
          state.sentimentScoreLoading = false;
          state.sentimentScore = initSentimentScore;
        }
      }
    ),
    getMovingSentimentScore: create.asyncThunk(
      async ({ symbol, fromDate, toDate }: StockDetailFilter) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/moving-sentiment-detail/${symbol}`,
          {
            query: {
              fromDate,
              toDate
            }
          }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.movingSentimentScoreLoading = true;
        },
        fulfilled: (state, action) => {
          state.movingSentimentScoreLoading = false;
          state.movingSentimentScore = transformMovingSentimentScore(
            action.payload
          );
        },
        rejected: (state) => {
          state.movingSentimentScoreLoading = false;
          state.movingSentimentScore = [];
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
    watchFundamentalDetailScore: (stock) => stock.fundamentalDetailScore,
    watchSentimentScoreLoading: (stock) => stock.sentimentScoreLoading,
    watchSentimentScore: (stock) => stock.sentimentScore,
    watchMovingSentimentScoreLoading: (stock) =>
      stock.movingSentimentScoreLoading,
    watchMovingSentimentScore: (stock) => stock.movingSentimentScore
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
  watchFundamentalDetailScore,
  watchSentimentScoreLoading,
  watchSentimentScore,
  watchMovingSentimentScoreLoading,
  watchMovingSentimentScore
} = stockDetailsSlice.selectors;

export const {
  getStockDetails,
  getFundamentalDetails,
  getFundamentalScore,
  getFundamentalDetailScore,
  getSentimentScore,
  getMovingSentimentScore
} = stockDetailsSlice.actions;
