import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { transformAlertLogsData } from '@/helpers/alert-logs.helper';

export type AlertLogsState = {
  loading: boolean;
  pagination: Pagination;
  alertLogsData: AlertLogs[];
  industryLoading: boolean;
  industries?: { industry: string }[];
  sectorLoading: boolean;
  sectors?: { sector: string }[];
};

const initialState: AlertLogsState = {
  loading: false,
  industryLoading: false,
  sectorLoading: false,
  alertLogsData: [],
  industries: [],
  sectors: [],
  pagination: PAGINATION
};

export const alertLogsSlice = createAppSlice({
  name: 'alert-logs',
  initialState,
  reducers: (create) => ({
    getAlertLogs: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          'tickers/get-stock-alert-log',
          {
            query
          }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.alertLogsData = transformAlertLogsData(action.payload.result);
          state.pagination = {
            currentPage: action.payload.offset,
            pageSize: action.payload.limit,
            total: Number(action.payload.total)
          };
        },
        rejected: (state) => {
          state.loading = false;
          state.alertLogsData = [];
          state.pagination = PAGINATION;
        }
      }
    )
  }),

  selectors: {
    watchAlertLogsLoading: (AlertLogs) => AlertLogs.loading,
    watchAlertLogsData: (AlertLogs) => AlertLogs.alertLogsData,
    watchAlertLogsPagination: (AlertLogs) => AlertLogs.pagination
  }
});

export const {
  watchAlertLogsLoading,
  watchAlertLogsData,
  watchAlertLogsPagination
} = alertLogsSlice.selectors;

export const { getAlertLogs } = alertLogsSlice.actions;
