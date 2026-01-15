import {
  transformCompanyNews,
  transformFinnhubAndLsegNews,
  transformCountSentiment,
  transformLisNewsSentiment,
  transformListNewsLatest,
  transformListWatcher,
  transformNewsScores,
  transformNewsScoreBySymbol,
  transformMarketPsychLatest,
  transformBreakingNews
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
  loadingNewsScores: boolean;
  loadingMarketPsych: boolean;
  loadingBreakingNews: boolean;
  listNews: NewsSentiment[];
  countSentiment: CountSentiment;
  companyNews: CompanyNews[];
  listWatcher: ListWatcher[];
  newLatest: NewsLatest[];
  newsSentiment: NewsSentiment[];
  finnhubAndLsegNews: any[];
  newsScores: NewsScore[];
  breakingNews: BreakingNews[];
  marketPsych: MarketPsych[];
  pagination: Pagination;
  listWatcherPagination: Pagination;
  newsLatestPagination: Pagination;
  listNewsPagination: Pagination;
  finnhubAndLsegNewsPagination: Pagination;
  newsScoresPagination: Pagination;
  marketPsychPagination: Pagination;
  newsScoreBySymbol: NewsScoreBySymbol | null;
  loadingNewsScoreBySymbol: boolean;
};

const initialState: SentimentState = {
  loading: false,
  loadingCountSentiment: false,
  loadingListWatcher: false,
  loadingNewsLatest: false,
  loadingNewsSentiment: false,
  loadingListNews: false,
  loadingFinnhubAndLsegNews: false,
  loadingNewsScores: false,
  loadingMarketPsych: false,
  loadingBreakingNews: false,
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
  newsScores: [],
  breakingNews: [],
  marketPsych: [],
  newsScoreBySymbol: null,
  loadingNewsScoreBySymbol: false,
  pagination: PAGINATION,
  listWatcherPagination: PAGINATION,
  newsLatestPagination: PAGINATION,
  listNewsPagination: PAGINATION,
  finnhubAndLsegNewsPagination: PAGINATION,
  newsScoresPagination: PAGINATION,
  marketPsychPagination: PAGINATION
};

export const SentimentSlice = createAppSlice({
  name: 'sentiment',
  initialState,
  reducers: (create) => ({
    getMarketPsychLatest: create.asyncThunk(
      async (query: MarketPsychFilter) => {
        const response = await defaultApiFetcher.get(
          'news/market-psych-latest',
          {
            query: {
              ...(convertParamsByMapping(query!) || {})
            }
          }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loadingMarketPsych = true;
        },
        fulfilled: (state, action) => {
          state.loadingMarketPsych = false;
          const result = action.payload.result || [];
          state.marketPsych = transformMarketPsychLatest(result);

          state.marketPsychPagination = {
            currentPage: action.payload.currentPage,
            pageSize: action.payload.limit,
            total: action.payload.totalResult
          };
        },
        rejected: (state) => {
          state.loadingMarketPsych = false;
          state.marketPsych = [];
          state.marketPsychPagination = PAGINATION;
        }
      }
    ),

    getCountSentiment: create.asyncThunk(
      async ({ symbol, query }: SentimentParams) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/count-sentiment-detail/${symbol}`,
          { query }
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
          { query }
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
          { query }
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
          { query }
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

    getNewsScores: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get('news/news-scores', {
          query: query ? convertParamsByMapping(query) : {}
        });
        return response.data;
      },
      {
        pending: (state) => {
          state.loadingNewsScores = true;
        },
        fulfilled: (state, action) => {
          state.loadingNewsScores = false;
          state.newsScores = transformNewsScores(
            action.payload.data?.result || action.payload.result || []
          );
          state.newsScoresPagination = {
            currentPage: action.payload.currentPage,
            pageSize: action.payload.limit,
            total: action.payload.totalResult
          };
        },
        rejected: (state) => {
          state.loadingNewsScores = false;
          state.newsScores = [];
          state.newsScoresPagination = PAGINATION;
        }
      }
    ),

    getNewsScoreBySymbol: create.asyncThunk(
      async ({ symbol }: { symbol: string }) => {
        const response = await defaultApiFetcher.get('news/scores-by-symbol', {
          query: { symbol }
        });
        return response.data;
      },
      {
        pending: (state) => {
          state.loadingNewsScoreBySymbol = true;
        },
        fulfilled: (state, action) => {
          state.loadingNewsScoreBySymbol = false;
          state.newsScoreBySymbol = transformNewsScoreBySymbol(action.payload);
        },
        rejected: (state) => {
          state.loadingNewsScoreBySymbol = false;
          state.newsScoreBySymbol = null;
        }
      }
    ),

    getBreakingNews: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          'news/get-latest-breaking-news',
          {
            query: query ? convertParamsByMapping(query) : {}
          }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loadingBreakingNews = true;
        },
        fulfilled: (state, action) => {
          state.loadingBreakingNews = false;
          state.breakingNews = transformBreakingNews(action.payload || []);
        },
        rejected: (state) => {
          state.loadingBreakingNews = false;
          state.breakingNews = [];
        }
      }
    ),

    resetState: create.reducer((state) => {
      const { breakingNews, loadingBreakingNews } = state;
      Object.assign(state, initialState);
      state.breakingNews = breakingNews;
      state.loadingBreakingNews = loadingBreakingNews;
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
      state.finnhubAndLsegNewsPagination,
    watchNewsScoresLoading: (state) => state.loadingNewsScores,
    watchNewsScores: (state) => state.newsScores,
    watchNewsScoreBySymbol: (state) => state.newsScoreBySymbol,
    watchNewsScoresPagination: (state) => state.newsScoresPagination,
    watchMarketPsych: (state) => state.marketPsych,
    watchMarketPsychLoading: (state) => state.loadingMarketPsych,
    watchMarketPsychPagination: (state) => state.marketPsychPagination,
    watchBreakingNewsLoading: (state) => state.loadingBreakingNews,
    watchBreakingNews: (state) => state.breakingNews
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
  watchFinnhubAndLsegNewsPagination,
  watchNewsScoresLoading,
  watchNewsScores,
  watchNewsScoreBySymbol,
  watchNewsScoresPagination,
  watchMarketPsych,
  watchMarketPsychLoading,
  watchMarketPsychPagination,
  watchBreakingNewsLoading,
  watchBreakingNews
} = SentimentSlice.selectors;

export const {
  getNewsScoreBySymbol,
  getMarketPsychLatest,
  getCountSentiment,
  getCompanyNews,
  getListWatcher,
  getNewsLatest,
  getTickerNewsSentiment,
  getListNews,
  getFinnhubAndLsegNews,
  getNewsScores,
  getBreakingNews,
  resetState
} = SentimentSlice.actions;
