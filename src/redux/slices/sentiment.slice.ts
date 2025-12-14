import {
  transformCompanyNews,
  transformFinnhubAndLsegNews,
  transformCountSentiment,
  transformLisNewsSentiment,
  transformListNewsLatest,
  transformListWatcher
} from '@/helpers/sentiment.helper';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { PAGINATION } from '@/constants/pagination.constant';
import { convertParamsByMapping } from '@/utils/common';

export type SentimentState = {
  loading: boolean;
  loadingCountSentiment: boolean;
  loadingListWatcher: boolean;
  loadingNewsLatest: boolean;
  loadingNewsSentiment: boolean;
  loadingListNews: boolean;
  loadingFinnhubAndLsegNews: boolean;
  listNews: NewsSentiment[];
  countSentiment: CountSentiment;
  companyNews: CompanyNews[];
  listWatcher: ListWatcher[];
  newLatest: NewsLatest[];
  newsSentiment: NewsSentiment[];
  finnhubAndLsegNews: any[];
  pagination: Pagination;
  listWatcherPagination: Pagination;
  newsLatestPagination: Pagination;
  listNewsPagination: Pagination;
  finnhubAndLsegNewsPagination: Pagination;
};

const initialState: SentimentState = {
  loading: false,
  loadingCountSentiment: false,
  loadingListWatcher: false,
  loadingNewsLatest: false,
  loadingNewsSentiment: false,
  loadingListNews: false,
  loadingFinnhubAndLsegNews: false,
  listNews: [],
  countSentiment: {
    countPositive: 0,
    countVeryPositive: 0,
    countNegative: 0,
    countVeryNegative: 0
  },
  companyNews: [],
  listWatcher: [],
  newLatest: [],
  newsSentiment: [],
  finnhubAndLsegNews: [],
  pagination: PAGINATION,
  listWatcherPagination: PAGINATION,
  newsLatestPagination: PAGINATION,
  listNewsPagination: PAGINATION,
  finnhubAndLsegNewsPagination: PAGINATION
};

export const SentimentSlice = createAppSlice({
  name: 'sentiment',
  initialState,
  reducers: (create) => ({
    getCountSentiment: create.asyncThunk(
      async ({ symbol, query }: SentimentParams) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/count-sentiment-detail/${symbol}`,
          {
            query
          }
        );
        return response.data[0];
      },
      {
        pending: (state) => {
          state.loadingCountSentiment = true;
        },
        fulfilled: (state, action) => {
          state.loadingCountSentiment = false;
          state.countSentiment = transformCountSentiment(action.payload);
        },
        rejected: (state) => {
          state.loadingCountSentiment = false;
          state.countSentiment = state.countSentiment;
        }
      }
    ),
    getCompanyNews: create.asyncThunk(
      async ({ symbol, query }: SentimentParams) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/company-news-detail/${symbol}`,
          { query }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.companyNews = transformCompanyNews(action.payload.result);
          state.pagination = {
            currentPage: action.payload.offset,
            pageSize: action.payload.limit,
            total: Number(action.payload.total)
          };
        },
        rejected: (state) => {
          state.loading = false;
          state.companyNews = [];
          state.pagination = PAGINATION;
        }
      }
    ),
    getListWatcher: create.asyncThunk(
      async (query?: SentimentFilter) => {
        const response = await defaultApiFetcher.get(
          'stock-scores/list-watcher',
          {
            query
          }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loadingListWatcher = true;
        },
        fulfilled: (state, action) => {
          state.loadingListWatcher = false;
          state.listWatcher = transformListWatcher(action.payload.result);
          state.listWatcherPagination = {
            currentPage: action.payload.offset,
            pageSize: action.payload.limit,
            total: Number(action.payload.total)
          };
        },
        rejected: (state) => {
          state.loadingListWatcher = false;
          state.listWatcher = [];
          state.listWatcherPagination = PAGINATION;
        }
      }
    ),
    getNewsLatest: create.asyncThunk(
      async (query?: SentimentFilter) => {
        const response = await defaultApiFetcher.get(
          'stock-scores/list-news-latest',
          {
            query
          }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loadingNewsLatest = true;
        },
        fulfilled: (state, action) => {
          state.loadingNewsLatest = false;
          state.newLatest = transformListNewsLatest(action.payload.result);
          state.newsLatestPagination = {
            currentPage: action.payload.offset,
            pageSize: action.payload.limit,
            total: Number(action.payload.total)
          };
        },
        rejected: (state) => {
          state.loadingNewsLatest = false;
          state.newLatest = [];
          state.newsLatestPagination = PAGINATION;
        }
      }
    ),
    getTickerNewsSentiment: create.asyncThunk(
      async ({ symbol, query }: SentimentParams) => {
        const response = await defaultApiFetcher.get(
          'tickers/get-news-sentiment',
          {
            query: { ...(convertParamsByMapping(query!) || {}), symbol }
          }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loadingNewsSentiment = true;
        },
        fulfilled: (state, action) => {
          state.loadingNewsSentiment = false;
          state.newsSentiment = transformLisNewsSentiment(action.payload) || [];
        },
        rejected: (state) => {
          state.loadingNewsSentiment = false;
          state.newsSentiment = [];
        }
      }
    ),
    getListNews: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          'tickers/get-news-sentiment-details',
          {
            query
          }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loadingListNews = true;
        },
        fulfilled: (state, action) => {
          state.loadingListNews = false;
          state.listNews =
            transformLisNewsSentiment(action.payload.result) || [];
          state.listNewsPagination = {
            currentPage: action.payload.offset,
            pageSize: Number(action.payload.limit),
            total: action.payload.total
          };
        },
        rejected: (state) => {
          state.loadingListNews = false;
          state.listNews = [];
          state.listNewsPagination = PAGINATION;
        }
      }
    ),
    getFinnhubAndLsegNews: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get('news/list', {
          query: query ? convertParamsByMapping(query) : {}
        });
        return response.data;
      },
      {
        pending: (state) => {
          state.loadingFinnhubAndLsegNews = true;
        },
        fulfilled: (state, action) => {
          state.loadingFinnhubAndLsegNews = false;

          const result = action.payload.result ?? [];

          state.finnhubAndLsegNews = transformFinnhubAndLsegNews(result);

          state.finnhubAndLsegNewsPagination = {
            currentPage: action.payload.currentPage,
            pageSize: Number(action.payload.limit),
            total: action.payload.totalResult
          };
        },
        rejected: (state) => {
          state.loadingFinnhubAndLsegNews = false;
          state.finnhubAndLsegNews = [];
          state.finnhubAndLsegNewsPagination = PAGINATION;
        }
      }
    ),
    resetState: create.reducer((state) => {
      Object.assign(state, initialState);
    })
  }),

  selectors: {
    watchCompanyNewsLoading: (state) => state.loading,
    watchCountSentimentLoading: (state) => state.loadingCountSentiment,
    watchCountSentiment: (state) => state.countSentiment,
    watchCompanyNews: (state) => state.companyNews,
    watchCompanyNewsPagination: (state) => state.pagination,
    watchListWatcherLoading: (state) => state.loadingListWatcher,
    watchListWatcher: (state) => state.listWatcher,
    watchListWatcherPagination: (state) => state.listWatcherPagination,
    watchListNewsLatest: (state) => state.newLatest,
    watchListNewsLatestPagination: (state) => state.newsLatestPagination,
    watchTickerNewsSentimentLoading: (state) => state.loadingNewsSentiment,
    watchTickerNewsSentiment: (state) => state.newsSentiment,
    watchListNewsLoading: (state) => state.loadingListNews,
    watchListNews: (state) => state.listNews,
    watchListNewsPagination: (state) => state.listNewsPagination,
    watchFinnhubAndLsegNewsLoading: (state) => state.loadingFinnhubAndLsegNews,
    watchFinnhubAndLsegNews: (state) => state.finnhubAndLsegNews,
    watchFinnhubAndLsegNewsPagination: (state) =>
      state.finnhubAndLsegNewsPagination
  }
});

export const {
  watchCompanyNewsLoading,
  watchCountSentimentLoading,
  watchCountSentiment,
  watchCompanyNews,
  watchCompanyNewsPagination,
  watchListWatcher,
  watchListWatcherPagination,
  watchListWatcherLoading,
  watchListNewsLatest,
  watchListNewsLatestPagination,
  watchTickerNewsSentimentLoading,
  watchTickerNewsSentiment,
  watchListNewsLoading,
  watchListNews,
  watchListNewsPagination,
  watchFinnhubAndLsegNewsLoading,
  watchFinnhubAndLsegNews,
  watchFinnhubAndLsegNewsPagination
} = SentimentSlice.selectors;

export const {
  getCountSentiment,
  getCompanyNews,
  getListWatcher,
  getNewsLatest,
  getTickerNewsSentiment,
  getListNews,
  getFinnhubAndLsegNews,
  resetState
} = SentimentSlice.actions;
