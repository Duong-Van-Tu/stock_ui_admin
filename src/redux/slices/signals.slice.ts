import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  transformAlertLogsData,
  transformStrategyData
} from '@/helpers/signals.helper';

export type AlertLogsState = {
  loading: boolean;
  alertLogsLoading: boolean;
  pagination: Pagination;
  alertLogsData: AlertLogs[];
  signalByStrategyId: Record<string, AlertLogs[]>;
  strategies: Strategies;
};

const initialState: AlertLogsState = {
  loading: false,
  alertLogsLoading: false,
  strategies: [],
  alertLogsData: [],
  signalByStrategyId: {},
  pagination: PAGINATION
};

export const signalSlice = createAppSlice({
  name: 'signals',
  initialState,
  reducers: (create) => ({
    getStrategies: create.asyncThunk(
      async () => {
        const response = await defaultApiFetcher.get('tickers/strategy');
        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.strategies = transformStrategyData(action.payload);
        },
        rejected: (state) => {
          state.loading = false;
          state.strategies = [];
        }
      }
    ),
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
          state.alertLogsLoading = true;
        },
        fulfilled: (state, action) => {
          state.alertLogsLoading = false;
          state.alertLogsData = transformAlertLogsData(action.payload.result);
          state.pagination = {
            currentPage: action.payload.offset,
            pageSize: action.payload.limit,
            total: Number(action.payload.total)
          };
        },
        rejected: (state) => {
          state.alertLogsLoading = false;
          state.alertLogsData = [];
          state.pagination = PAGINATION;
        }
      }
    ),
    getSignalStrategyId: create.asyncThunk(
      async ({
        strategyId,
        ...query
      }: { strategyId: number } & Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          'tickers/get-stock-alert-log',
          { query: { strategyId, ...query } }
        );
        return { data: response.data, strategyId };
      },
      {
        fulfilled: (state, action) => {
          const { data, strategyId } = action.payload;
          state.signalByStrategyId[strategyId] = transformAlertLogsData(
            data.result
          );
        },
        rejected: (state, action) => {
          const { strategyId } = action.meta.arg;
          state.signalByStrategyId[strategyId] = [];
        }
      }
    )
  }),

  selectors: {
    watchStrategies: (signals) => signals.strategies,
    watchStrategyLoading: (signals) => signals.loading,
    watchAlertLogsLoading: (signals) => signals.alertLogsLoading,
    watchAlertLogsData: (signals) => signals.alertLogsData,
    watchAlertLogsPagination: (signals) => signals.pagination,
    watchSignalByStrategyId: (signals) => signals.signalByStrategyId
  }
});

export const {
  watchStrategyLoading,
  watchStrategies,
  watchAlertLogsLoading,
  watchAlertLogsData,
  watchSignalByStrategyId,
  watchAlertLogsPagination
} = signalSlice.selectors;

export const { getAlertLogs, getStrategies, getSignalStrategyId } =
  signalSlice.actions;
