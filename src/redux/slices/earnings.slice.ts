import {
  transformEarnings,
  transformEarningsSummary
} from '@/helpers/earnings.helper';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { PAGINATION } from '@/constants/pagination.constant';

export type EarningsState = {
  loading: boolean;
  loadingEarningsSummary: boolean;
  earningsSummary: EarningsSummary[];
  earnings: Earning[];
  earningsFilter: Earning[];
  pagination: Pagination;
};

const initialState: EarningsState = {
  loading: false,
  loadingEarningsSummary: false,
  earningsSummary: [],
  earnings: [],
  earningsFilter: [],
  pagination: PAGINATION
};

export const earningsSlice = createAppSlice({
  name: 'earnings',
  initialState,
  reducers: (create) => ({
    getCountEarningsCalendar: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          'stock-scores/get-count-earning-calender-nextdate',
          {
            query
          }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loadingEarningsSummary = true;
        },
        fulfilled: (state, action) => {
          state.loadingEarningsSummary = false;
          state.earningsSummary = transformEarningsSummary(action.payload);
        },
        rejected: (state) => {
          state.loadingEarningsSummary = false;
          state.earningsSummary = [];
        }
      }
    ),
    getEarnings: create.asyncThunk(
      async (params?: Record<string, any>) => {
        const response = await defaultApiFetcher.post(
          `stock-scores/get-earning-calender-nextdate?symbol=${params?.symbol}&fromDate=${params?.fromDate}&toDate=${params?.toDate}`,
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
          state.earnings = transformEarnings(action.payload.result);
          state.pagination = {
            currentPage: action.payload.offset,
            pageSize: action.payload.limit,
            total: Number(action.payload.total)
          };
        },
        rejected: (state) => {
          state.loading = false;
          state.earnings = [];
          state.pagination = PAGINATION;
        }
      }
    ),
    getEarningsFilter: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          'stock-scores/get-earning-calender-filter',
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
          state.earningsFilter = transformEarnings(action.payload);
        },
        rejected: (state) => {
          state.loading = false;
          state.earningsFilter = [];
        }
      }
    )
  }),

  selectors: {
    watchEarningsLoading: (earning) => earning.loading,
    watchEarningSummaryLoading: (earning) => earning.loadingEarningsSummary,
    watchEarningsSummary: (earning) => earning.earningsSummary,
    watchEarnings: (earning) => earning.earnings,
    watchEarningsFilter: (earning) => earning.earningsFilter,
    watchEarningPagination: (earning) => earning.pagination
  }
});

export const {
  watchEarningsLoading,
  watchEarningSummaryLoading,
  watchEarningsSummary,
  watchEarnings,
  watchEarningPagination,
  watchEarningsFilter
} = earningsSlice.selectors;

export const { getCountEarningsCalendar, getEarnings, getEarningsFilter } =
  earningsSlice.actions;
