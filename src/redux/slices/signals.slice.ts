import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  transformSignalsData,
  transformStrategyData
} from '@/helpers/signals.helper';
import { PayloadAction } from '@reduxjs/toolkit';
import { convertParamsByMapping } from '@/utils/common';

export type SignalsState = {
  loading: boolean;
  alertLogsLoading: boolean;
  signalStrategyLoading: Record<number, boolean>;
  exitLoading: boolean;
  pagination: Pagination;
  paginationByStrategyId: Record<number, Pagination>;
  alertLogsData: Signal[];
  signalOptions: Signal[];
  signalByStrategyId: Record<string, Signal[]>;
  strategies: Strategies;
};

const initialState: SignalsState = {
  loading: false,
  alertLogsLoading: false,
  exitLoading: false,
  signalStrategyLoading: {},
  strategies: [],
  alertLogsData: [],
  signalOptions: [],
  signalByStrategyId: {},
  pagination: PAGINATION,
  paginationByStrategyId: {}
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
      async ({
        isOptions,
        ...query
      }: { isOptions?: boolean } & Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          'tickers/get-stock-alert-log',
          {
            query: {
              isImport: isOptions === undefined ? undefined : isOptions ? 1 : 0,
              ...query
            }
          }
        );
        return { data: response.data, isOptions };
      },
      {
        pending: (state) => {
          state.alertLogsLoading = true;
        },
        fulfilled: (state, action) => {
          const { data, isOptions } = action.payload;
          state.alertLogsLoading = false;
          state.alertLogsData = isOptions
            ? []
            : transformSignalsData(data.result);
          state.signalOptions = isOptions
            ? transformSignalsData(data.result)
            : [];
          state.pagination = {
            currentPage: data.offset,
            pageSize: data.limit,
            total: Number(data.total)
          };
        },
        rejected: (state) => {
          state.alertLogsLoading = false;
          state.alertLogsData = [];
          state.signalOptions = [];
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
          { query: { strategyId, isImport: 0, ...query } }
        );
        return { data: response.data, strategyId };
      },
      {
        pending: (state, action) => {
          const { strategyId } = action.meta.arg;
          state.signalStrategyLoading[strategyId] = true;
        },
        fulfilled: (state, action) => {
          const { data, strategyId } = action.payload;
          state.signalStrategyLoading[strategyId] = false;
          state.signalByStrategyId[strategyId] = transformSignalsData(
            data.result
          );
          state.paginationByStrategyId[strategyId] = {
            currentPage: data.offset,
            pageSize: data.limit,
            total: Number(data.total)
          };
        },
        rejected: (state, action) => {
          const { strategyId } = action.meta.arg;
          state.signalStrategyLoading[strategyId] = false;
          state.signalByStrategyId[strategyId] = [];
          state.paginationByStrategyId[strategyId] = PAGINATION;
        }
      }
    ),
    updateScheduleExitDate: create.asyncThunk(
      async (params: { ids: string[]; scheduleExitDate: string }) => {
        await defaultApiFetcher.post(
          'tickers/update-schedule-exit-date',
          convertParamsByMapping(params)
        );
      },
      {
        pending: (state) => {
          state.exitLoading = true;
        },
        fulfilled: (state) => {
          state.exitLoading = false;
        },
        rejected: (state) => {
          state.exitLoading = false;
        }
      }
    ),
    updateAlertLogsData: create.reducer(
      (
        state,
        action: PayloadAction<Array<{ id: number } & Partial<Signal>>>
      ) => {
        const updatesMap = new Map(
          action.payload.map(({ id, ...updates }) => [id, updates])
        );

        state.alertLogsData = state.alertLogsData.map((signal) => {
          if (updatesMap.has(signal.id)) {
            return { ...signal, ...updatesMap.get(signal.id)! };
          }
          return signal;
        });
      }
    )
  }),

  selectors: {
    watchStrategies: (state) => state.strategies,
    watchStrategyLoading: (state) => state.loading,
    watchSignalStrategyLoading: (state) => (strategyId: number) =>
      state.signalStrategyLoading[strategyId] || false,
    watchAlertLogsLoading: (state) => state.alertLogsLoading,
    watchAlertLogsData: (state) => state.alertLogsData,
    watchSignalOptions: (state) => state.signalOptions,
    watchAlertLogsPagination: (state) => state.pagination,
    watchSignalByStrategyId: (state) => state.signalByStrategyId,
    watchSignalPaginationByStrategyId: (state) => (strategyId: number) =>
      state.paginationByStrategyId[strategyId] || PAGINATION,
    watchExitLoading: (state) => state.exitLoading
  }
});

export const {
  watchStrategyLoading,
  watchStrategies,
  watchAlertLogsLoading,
  watchAlertLogsData,
  watchSignalByStrategyId,
  watchAlertLogsPagination,
  watchSignalStrategyLoading,
  watchSignalPaginationByStrategyId,
  watchSignalOptions,
  watchExitLoading
} = signalSlice.selectors;

export const {
  getAlertLogs,
  getStrategies,
  getSignalStrategyId,
  updateAlertLogsData,
  updateScheduleExitDate
} = signalSlice.actions;
