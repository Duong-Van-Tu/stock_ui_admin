import {
  transformCompanyNews,
  transformCountSentiment
} from '@/helpers/sentiment.helper';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { PAGINATION } from '@/constants/pagination.constant';

export type SentimentState = {
  loading: boolean;
  loadingCountSentiment: boolean;
  countSentiment: CountSentiment;
  companyNews: CompanyNews[];
  pagination: Pagination;
};

const initialState: SentimentState = {
  loading: false,
  loadingCountSentiment: false,
  countSentiment: {
    countPositive: 0,
    countVeryPositive: 0,
    countNegative: 0,
    countVeryNegative: 0
  },
  companyNews: [],
  pagination: PAGINATION
};

export const SentimentSlice = createAppSlice({
  name: 'sentiment',
  initialState,
  reducers: (create) => ({
    getCountSentiment: create.asyncThunk(
      async ({ symbol, query }: GetCountSentimentParams) => {
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
      async (params?: Record<string, any>) => {
        const response = await defaultApiFetcher.post(
          'stock-scores/company-news-detail',
          params
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
    )
  }),

  selectors: {
    watchCompanyNewsLoading: (sentiment) => sentiment.loading,
    watchCountSentimentLoading: (sentiment) => sentiment.loadingCountSentiment,
    watchCountSentiment: (sentiment) => sentiment.countSentiment,
    watchSentiment: (sentiment) => sentiment.companyNews,
    watchCompanyNewsPagination: (sentiment) => sentiment.pagination
  }
});

export const {
  watchCompanyNewsLoading,
  watchCountSentimentLoading,
  watchCountSentiment,
  watchSentiment,
  watchCompanyNewsPagination
} = SentimentSlice.selectors;

export const { getCountSentiment, getCompanyNews } = SentimentSlice.actions;
