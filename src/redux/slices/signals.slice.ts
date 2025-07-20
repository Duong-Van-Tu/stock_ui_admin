import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  transformSignalsData,
  transformStrategyData
} from '@/helpers/signals.helper';
import { PayloadAction } from '@reduxjs/toolkit';
import { convertParamsByMapping } from '@/utils/common';
import { AppThunk } from '../store';

export type SignalsState = {
  loading: boolean;
  alertLogsLoading: boolean;
  signalStrategyLoading: Record<number, boolean>;
  exitLoading: boolean;
  pagination: Pagination;
  paginationByStrategyId: Record<number, Pagination>;
  signal: Signal | null;
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
  paginationByStrategyId: {},
  signal: null
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
        isSymbolSpecific,
        ...query
      }: { isOptions?: boolean; isSymbolSpecific?: boolean } & Record<
        string,
        any
      >) => {
        const response = await defaultApiFetcher.get(
          isSymbolSpecific
            ? 'tickers/get-stock-alert-log-fix'
            : 'tickers/get-stock-alert-log',
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
    getSignalById: create.asyncThunk(
      async (id: number) => {
        const response = await defaultApiFetcher.get(
          `tickers/get-stock-alert-log/${id}`
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.signal = transformSignalsData([action.payload])[0];
        },
        rejected: (state) => {
          state.loading = false;
          state.signal = null;
        }
      }
    ),
    exitNow: create.asyncThunk(
      async (params: { hashIds: string[] }) => {
        await defaultApiFetcher.post(
          'stock-worker/exit-now',
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
        action: PayloadAction<
          Array<({ id: number } | { hashAlertLogId: string }) & Partial<Signal>>
        >
      ) => {
        const updatesById = new Map<number, Partial<Signal>>();
        const updatesByHash = new Map<string, Partial<Signal>>();

        for (const item of action.payload) {
          if ('id' in item) {
            const { id, ...updates } = item;
            updatesById.set(id!, updates);
          } else if ('hashAlertLogId' in item) {
            const { hashAlertLogId, ...updates } = item;
            updatesByHash.set(hashAlertLogId, updates);
          }
        }

        state.alertLogsData = state.alertLogsData.map((signal) => {
          if (updatesById.has(signal.id)) {
            return { ...signal, ...updatesById.get(signal.id)! };
          } else if (
            signal.hashAlertLogId &&
            updatesByHash.has(signal.hashAlertLogId)
          ) {
            return { ...signal, ...updatesByHash.get(signal.hashAlertLogId)! };
          }
          return signal;
        });
      }
    ),
    updateSignalsData: create.reducer(
      (
        state,
        action: PayloadAction<{ strategyId: number } & Record<string, any>>
      ) => {
        const { data, strategyId } = action.payload;

        state.signalByStrategyId[strategyId] = transformSignalsData(
          data.result
        );
        state.paginationByStrategyId[strategyId] = {
          currentPage: data.offset,
          pageSize: data.limit,
          total: Number(data.total)
        };
      }
    ),
    resetState: create.reducer((state) => {
      Object.assign(state, initialState);
    })
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
    watchExitLoading: (state) => state.exitLoading,
    watchSignal: (state) => state.signal
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
  watchExitLoading,
  watchSignal
} = signalSlice.selectors;

export const {
  getAlertLogs,
  getStrategies,
  getSignalStrategyId,
  updateAlertLogsData,
  exitNow,
  updateSignalsData,
  resetState,
  getSignalById
} = signalSlice.actions;

export const autoUpdateSignalData =
  ({
    strategyId,
    ...query
  }: { strategyId: number } & Record<string, any>): AppThunk =>
  async (dispatch) => {
    const response = await defaultApiFetcher.get(
      'tickers/get-stock-alert-log',
      { query: { strategyId, isImport: 0, ...query } }
    );

    if (response.data) {
      dispatch(
        updateSignalsData({
          strategyId,
          data: response.data
        })
      );
    }
  };
