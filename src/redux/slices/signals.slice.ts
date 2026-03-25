import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  transformLatestHitOnePercentData,
  transformSignalsData,
  transformStrategyData,
  transformLatestExitInTradeData
} from '@/helpers/signals.helper';
import { PayloadAction } from '@reduxjs/toolkit';
import { convertParamsByMapping } from '@/utils/common';
import { AppThunk } from '../store';

export type SignalsState = {
  loading: boolean;
  alertLogsLoading: boolean;
  optionLoading: boolean;
  signalStrategyLoading: Record<number, boolean>;
  exitLoading: boolean;
  categoryActionLoading: Record<number, boolean>;
  pagination: Pagination;
  optionPagination: Pagination;
  paginationByStrategyId: Record<number, Pagination>;
  signal: Signal | null;
  alertLogsData: Signal[];
  signalOptions: Signal[];
  signalByStrategyId: Record<string, Signal[]>;
  strategies: Strategies;
  latestEntryDate: string | null;
  latestEntryDateLoading: boolean;
  latestHitOnePercent: string[];
  latestHitOnePercentLoading: boolean;
  latestExitInTrade: LatestExitInTrade[];
  latestExitInTradeLoading: boolean;
};

const initialState: SignalsState = {
  loading: false,
  alertLogsLoading: false,
  optionLoading: false,
  exitLoading: false,
  signalStrategyLoading: {},
  categoryActionLoading: {},
  strategies: [],
  alertLogsData: [],
  signalOptions: [],
  signalByStrategyId: {},
  pagination: PAGINATION,
  optionPagination: PAGINATION,
  paginationByStrategyId: {},
  signal: null,
  latestEntryDate: null,
  latestEntryDateLoading: false,
  latestHitOnePercent: [],
  latestHitOnePercentLoading: false,
  latestExitInTrade: [],
  latestExitInTradeLoading: false
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
        isFilterPage,
        ...query
      }: {
        isOptions?: boolean;
        isSymbolSpecific?: boolean;
        isFilterPage?: boolean;
      } & Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          isSymbolSpecific
            ? 'tickers/get-stock-alert-log-fix'
            : isFilterPage
              ? 'tickers/get-stock-alert-log-filter'
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
        pending: (state, action) => {
          if (action.meta.arg.isOptions) {
            state.optionLoading = true;
          } else {
            state.alertLogsLoading = true;
          }
        },
        fulfilled: (state, action) => {
          const { data, isOptions } = action.payload;
          if (isOptions) {
            state.optionLoading = false;
            state.signalOptions = transformSignalsData(data.result);
            state.optionPagination = {
              currentPage: data.offset,
              pageSize: data.limit,
              total: Number(data.total)
            };
          } else {
            state.alertLogsLoading = false;
            state.alertLogsData = transformSignalsData(data.result);
            state.pagination = {
              currentPage: data.offset,
              pageSize: data.limit,
              total: Number(data.total)
            };
          }
        },
        rejected: (state) => {
          state.alertLogsLoading = false;
          state.optionLoading = false;
          state.alertLogsData = [];
          state.signalOptions = [];
          state.pagination = PAGINATION;
          state.optionPagination = PAGINATION;
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
    getLatestEntryDate: create.asyncThunk(
      async () => {
        const response = await defaultApiFetcher.get(
          'tickers/latest-entry-date'
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.latestEntryDateLoading = true;
        },
        fulfilled: (state, action) => {
          state.latestEntryDateLoading = false;
          state.latestEntryDate = action.payload?.latest_entry_date ?? null;
        },
        rejected: (state) => {
          state.latestEntryDateLoading = false;
          state.latestEntryDate = null;
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
    getLatestHitOnePercent: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          'tickers/latest-hit-one-percent',
          { query }
        );
        return response.data ?? [];
      },
      {
        pending: (state) => {
          state.latestHitOnePercentLoading = true;
        },
        fulfilled: (state, action) => {
          state.latestHitOnePercentLoading = false;
          state.latestHitOnePercent = transformLatestHitOnePercentData(
            action.payload
          );
        },
        rejected: (state) => {
          state.latestHitOnePercentLoading = false;
          state.latestHitOnePercent = [];
        }
      }
    ),
    getLatestExitInTrade: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          'tickers/latest-exit-in-trade',
          { query }
        );
        return response.data ?? [];
      },
      {
        pending: (state) => {
          state.latestExitInTradeLoading = true;
        },
        fulfilled: (state, action) => {
          state.latestExitInTradeLoading = false;
          state.latestExitInTrade = transformLatestExitInTradeData(
            action.payload
          );
        },
        rejected: (state) => {
          state.latestExitInTradeLoading = false;
          state.latestExitInTrade = [];
        }
      }
    ),

    addAlertLogToCategory: create.asyncThunk(
      async (params: { alertLogId: number; categoryId: number }) => {
        await defaultApiFetcher.post(
          'tickers/add-alert-log-to-category',
          params
        );
        return params;
      },
      {
        pending: (state, action) => {
          const { alertLogId } = action.meta.arg;
          state.categoryActionLoading[alertLogId] = true;
        },
        fulfilled: (state, action) => {
          const { alertLogId, categoryId } = action.payload;
          state.categoryActionLoading[alertLogId] = false;
          state.alertLogsData = state.alertLogsData.map((s) =>
            s.id === alertLogId
              ? { ...s, categoryIds: [...(s.categoryIds ?? []), categoryId] }
              : s
          );
        },
        rejected: (state, action) => {
          const { alertLogId } = action.meta.arg as { alertLogId: number };
          state.categoryActionLoading[alertLogId] = false;
        }
      }
    ),

    deleteAlertLogInCategory: create.asyncThunk(
      async (params: { alertLogIds: number[]; categoryId: number }) => {
        await defaultApiFetcher.post(
          'tickers/delete-alert-log-in-category',
          params
        );
        return params;
      },
      {
        pending: (state, action) => {
          const { alertLogIds } = action.meta.arg;
          alertLogIds.forEach((alertLogId) => {
            state.categoryActionLoading[alertLogId] = true;
          });
        },
        fulfilled: (state, action) => {
          const { alertLogIds, categoryId } = action.payload;
          alertLogIds.forEach((alertLogId) => {
            state.categoryActionLoading[alertLogId] = false;
            state.alertLogsData = state.alertLogsData.map((s) => {
              if (s.id === alertLogId) {
                return {
                  ...s,
                  categoryIds: s.categoryIds?.filter((id) => id !== categoryId)
                };
              }
              return s;
            });
          });
        },
        rejected: (state, action) => {
          const { alertLogIds } = action.meta.arg as { alertLogIds: number[] };
          alertLogIds.forEach((alertLogId) => {
            state.categoryActionLoading[alertLogId] = false;
          });
        }
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
    watchOptionLoading: (state) => state.optionLoading,
    watchAlertLogsData: (state) => state.alertLogsData,
    watchSignalOptions: (state) => state.signalOptions,
    watchAlertLogsPagination: (state) => state.pagination,
    watchOptionAlertLogsPagination: (state) => state.optionPagination,
    watchSignalByStrategyId: (state) => state.signalByStrategyId,
    watchSignalPaginationByStrategyId: (state) => (strategyId: number) =>
      state.paginationByStrategyId[strategyId] || PAGINATION,
    watchExitLoading: (state) => state.exitLoading,
    watchSignal: (state) => state.signal,
    watchLatestEntryDate: (state) => state.latestEntryDate,
    watchLatestEntryDateLoading: (state) => state.latestEntryDateLoading,
    watchLatestHitOnePercentLoading: (state) =>
      state.latestHitOnePercentLoading,
    watchLatestHitOnePercent: (state) => state.latestHitOnePercent,
    watchLatestExitInTradeLoading: (state) => state.latestExitInTradeLoading,
    watchLatestExitInTrade: (state) => state.latestExitInTrade,
    watchCategoryActionLoading: (state) => (alertLogId: number) =>
      state.categoryActionLoading[alertLogId] || false,
    watchCategoryActionMap: (state) => state.categoryActionLoading
  }
});

export const {
  watchStrategyLoading,
  watchStrategies,
  watchAlertLogsLoading,
  watchOptionLoading,
  watchAlertLogsData,
  watchSignalByStrategyId,
  watchAlertLogsPagination,
  watchOptionAlertLogsPagination,
  watchSignalStrategyLoading,
  watchSignalPaginationByStrategyId,
  watchSignalOptions,
  watchExitLoading,
  watchSignal,
  watchLatestEntryDate,
  watchLatestEntryDateLoading,
  watchLatestHitOnePercentLoading,
  watchLatestHitOnePercent,
  watchLatestExitInTradeLoading,
  watchLatestExitInTrade,
  watchCategoryActionLoading,
  watchCategoryActionMap
} = signalSlice.selectors;

export const {
  getAlertLogs,
  getStrategies,
  getSignalStrategyId,
  updateAlertLogsData,
  exitNow,
  updateSignalsData,
  resetState,
  getSignalById,
  getLatestEntryDate,
  getLatestHitOnePercent,
  getLatestExitInTrade,
  addAlertLogToCategory,
  deleteAlertLogInCategory
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
