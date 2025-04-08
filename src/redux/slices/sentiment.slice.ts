import {
  transformCompanyNews,
  transformCountSentiment,
  transformListWatcher
} from '@/helpers/sentiment.helper';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { PAGINATION } from '@/constants/pagination.constant';

export type SentimentState = {
  loading: boolean;
  loadingCountSentiment: boolean;
  loadingListWatcher: boolean;
  countSentiment: CountSentiment;
  companyNews: CompanyNews[];
  listWatcher: ListWatcher[];
  pagination: Pagination;
  listWatcherPagination: Pagination;
};

const initialState: SentimentState = {
  loading: false,
  loadingCountSentiment: false,
  loadingListWatcher: false,
  countSentiment: {
    countPositive: 0,
    countVeryPositive: 0,
    countNegative: 0,
    countVeryNegative: 0
  },
  companyNews: [],
  listWatcher: [],
  pagination: PAGINATION,
  listWatcherPagination: PAGINATION
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
    )
  }),

  selectors: {
    watchCompanyNewsLoading: (sentiment) => sentiment.loading,
    watchCountSentimentLoading: (sentiment) => sentiment.loadingCountSentiment,
    watchCountSentiment: (sentiment) => sentiment.countSentiment,
    watchCompanyNews: (sentiment) => sentiment.companyNews,
    watchCompanyNewsPagination: (sentiment) => sentiment.pagination,
    watchListWatcherLoading: (sentiment) => sentiment.loadingListWatcher,
    watchListWatcher: (sentiment) => sentiment.listWatcher,
    watchListWatcherPagination: (sentiment) => sentiment.listWatcherPagination
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
  watchListWatcherLoading
} = SentimentSlice.selectors;

export const { getCountSentiment, getCompanyNews, getListWatcher } =
  SentimentSlice.actions;
