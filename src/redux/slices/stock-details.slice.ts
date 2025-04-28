import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  initEarningsScore,
  initFundamentalScore,
  initSentimentScore,
  transformEarningsDetails,
  transformEarningsDetailScore,
  transformEarningsScore,
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
  earningsScoreLoading: boolean;
  earningsScore: EarningsScore;
  earningsDetailScoreLoading: boolean;
  earningsDetailScore: EarningsDetailScore[];
  earningsDetailLoading: boolean;
  earningsDetails: EarningsDetails[];
};

const initialState: StockDetailsState = {
  loading: false,
  fundamentalDetailLoading: false,
  stockDetails: null,
  fundamentalScoreLoading: false,
  fundamentalScore: initFundamentalScore,
  fundamentalDetails: [],
  fundamentalDetailScoreLoading: false,
  fundamentalDetailScore: [],
  sentimentScoreLoading: false,
  sentimentScore: initSentimentScore,
  movingSentimentScoreLoading: false,
  movingSentimentScore: [],
  earningsScoreLoading: false,
  earningsScore: initEarningsScore,
  earningsDetailScoreLoading: false,
  earningsDetailScore: [],
  earningsDetailLoading: false,
  earningsDetails: []
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
    ),
    getEarningsScore: create.asyncThunk(
      async (symbol: string) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/earning-score/${symbol}`
        );
        return response.data[0];
      },
      {
        pending: (state) => {
          state.earningsScoreLoading = true;
        },
        fulfilled: (state, action) => {
          state.earningsScoreLoading = false;
          state.earningsScore = transformEarningsScore(action.payload);
        },
        rejected: (state) => {
          state.earningsScoreLoading = false;
          state.earningsScore = initEarningsScore;
        }
      }
    ),
    getEarningsDetailScore: create.asyncThunk(
      async (symbol: string) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/earning-score-detail/${symbol}`
        );

        return response.data;
      },
      {
        pending: (state) => {
          state.earningsDetailScoreLoading = true;
        },
        fulfilled: (state, action) => {
          state.earningsDetailScoreLoading = false;
          state.earningsDetailScore = transformEarningsDetailScore(
            action.payload
          );
        },
        rejected: (state) => {
          state.earningsDetailScoreLoading = false;
          state.earningsDetailScore = [];
        }
      }
    ),
    getEarningsDetails: create.asyncThunk(
      async (symbol: string) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/earning-detail/${symbol}`
        );

        return response.data;
      },
      {
        pending: (state) => {
          state.earningsDetailLoading = true;
        },
        fulfilled: (state, action) => {
          state.earningsDetailLoading = false;
          state.earningsDetails = transformEarningsDetails(action.payload);
        },
        rejected: (state) => {
          state.earningsDetailLoading = false;
          state.earningsDetails = [];
        }
      }
    )
  }),

  selectors: {
    watchStockDetailsLoading: (state) => state.loading,
    watchStockDetails: (state) => state.stockDetails,
    watchFundamentalDetailLoading: (state) => state.fundamentalDetailLoading,
    watchFundamentalDetails: (state) => state.fundamentalDetails,
    watchFundamentalScoreLoading: (state) => state.fundamentalScoreLoading,
    watchFundamentalScore: (state) => state.fundamentalScore,
    watchFundamentalDetailScoreLoading: (state) =>
      state.fundamentalDetailScoreLoading,
    watchFundamentalDetailScore: (state) => state.fundamentalDetailScore,
    watchSentimentScoreLoading: (state) => state.sentimentScoreLoading,
    watchSentimentScore: (state) => state.sentimentScore,
    watchMovingSentimentScoreLoading: (state) =>
      state.movingSentimentScoreLoading,
    watchMovingSentimentScore: (state) => state.movingSentimentScore,
    watchEarningsScoreLoading: (state) => state.earningsScoreLoading,
    watchEarningsScore: (state) => state.earningsScore,
    watchEarningsDetailScoreLoading: (state) =>
      state.earningsDetailScoreLoading,
    watchEarningsDetailScore: (state) => state.earningsDetailScore,
    watchEarningsDetailLoading: (state) => state.earningsDetailLoading,
    watchEarningsDetails: (state) => state.earningsDetails
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
  watchMovingSentimentScore,
  watchEarningsScoreLoading,
  watchEarningsScore,
  watchEarningsDetailScoreLoading,
  watchEarningsDetailScore,
  watchEarningsDetailLoading,
  watchEarningsDetails
} = stockDetailsSlice.selectors;

export const {
  getStockDetails,
  getFundamentalDetails,
  getFundamentalScore,
  getFundamentalDetailScore,
  getSentimentScore,
  getMovingSentimentScore,
  getEarningsScore,
  getEarningsDetailScore,
  getEarningsDetails
} = stockDetailsSlice.actions;
