import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  computeLedgerBalances,
  transformLedgerEntry
} from '@/helpers/ledger-entry.helper';
import { cleanFalsyValues, convertParamsByMapping } from '@/utils/common';

export type ledgerEntryState = {
  loading: boolean;
  updating: boolean;
  creating: boolean;
  sending: boolean;
  ledgerEntry: LedgerEntry[];
  balanceMap: Record<string, number>;
  cumulativeMap: Record<string, number>;
  selectedEntry: LedgerEntry | null;
  initialBalance: number;
  totalProfitLoss: number;
  balanceLoading: boolean;
  processingBalance: boolean;
  userBalance: {
    totalWithdraw: number;
    totalDeposit: number;
    currentBalance: number;
  };
};

const initialState: ledgerEntryState = {
  loading: false,
  updating: false,
  creating: false,
  sending: false,
  balanceLoading: false,
  selectedEntry: null,
  ledgerEntry: [],
  balanceMap: {},
  cumulativeMap: {},
  initialBalance: 0,
  totalProfitLoss: 0,
  processingBalance: false,
  userBalance: {
    totalWithdraw: 0,
    totalDeposit: 0,
    currentBalance: 0
  }
};

export const ledgerEntrySlice = createAppSlice({
  name: 'ledger-entry',
  initialState,
  reducers: (create) => ({
    getLedgerEntry: create.asyncThunk(
      async (params?: Record<string, any>) => {
        const response = await defaultApiFetcher.get('ledger-entry/get-list', {
          query: params ? convertParamsByMapping(params) : {}
        });
        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          const transformedEntries = transformLedgerEntry(
            action.payload.data.result
          );
          const { balanceMap, cumulativeMap, totalProfitLoss } =
            computeLedgerBalances(transformedEntries, state.initialBalance);

          state.ledgerEntry = transformedEntries;
          state.balanceMap = balanceMap;
          state.cumulativeMap = cumulativeMap;
          state.totalProfitLoss = totalProfitLoss;
        },
        rejected: (state) => {
          state.loading = false;
          state.ledgerEntry = [];
        }
      }
    ),
    getLedgerEntryById: create.asyncThunk(
      async (id: string) => {
        const response = await defaultApiFetcher.get(`ledger-entry/${id}`);
        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.selectedEntry = transformLedgerEntry(
            action.payload.data ? [action.payload.data] : []
          )[0];
        },
        rejected: (state) => {
          state.loading = false;
          state.selectedEntry = null;
        }
      }
    ),
    createLedgerEntry: create.asyncThunk(
      async (data: Partial<LedgerEntry>) => {
        const response = await defaultApiFetcher.post(
          'ledger-entry',
          convertParamsByMapping(data)
        );
        return response;
      },
      {
        pending: (state) => {
          state.creating = true;
        },
        fulfilled: (state, action) => {
          state.creating = false;
          const newEntry = transformLedgerEntry(
            action.payload.data ? [action.payload.data] : []
          )[0];
          if (newEntry) {
            const updatedEntries = [...state.ledgerEntry, newEntry];
            const { balanceMap, cumulativeMap, totalProfitLoss } =
              computeLedgerBalances(updatedEntries, state.initialBalance);

            state.ledgerEntry = updatedEntries;
            state.balanceMap = balanceMap;
            state.cumulativeMap = cumulativeMap;
            state.totalProfitLoss = totalProfitLoss;
          }
        },
        rejected: (state) => {
          state.creating = false;
        }
      }
    ),
    updateLedgerEntry: create.asyncThunk(
      async ({ id, data }: { id: string; data: Partial<LedgerEntry> }) => {
        await defaultApiFetcher.put(
          `ledger-entry/${id}`,
          convertParamsByMapping(data)
        );
      },
      {
        pending: (state) => {
          state.updating = true;
        },
        fulfilled: (state) => {
          state.updating = false;
        },
        rejected: (state) => {
          state.updating = false;
        }
      }
    ),
    deleteLedgerEntry: create.asyncThunk(
      async (id: number) => {
        await defaultApiFetcher.delete(`ledger-entry/${id}`);
        return id;
      },
      {
        pending: (state) => {
          state.updating = true;
        },
        fulfilled: (state, action) => {
          state.updating = false;
          state.ledgerEntry = state.ledgerEntry.filter(
            (entry) => entry.id !== action.payload
          );
          if (state.selectedEntry?.id === action.payload) {
            state.selectedEntry = null;
          }
          const { balanceMap, cumulativeMap, totalProfitLoss } =
            computeLedgerBalances(state.ledgerEntry, state.initialBalance);
          state.balanceMap = balanceMap;
          state.cumulativeMap = cumulativeMap;
          state.totalProfitLoss = totalProfitLoss;
        },
        rejected: (state) => {
          state.updating = false;
        }
      }
    ),
    sendAlertLedger: create.asyncThunk(
      async (payload: {
        emails: string[];
        telegrams: string[];
        ledgerEntry: LedgerEntry;
        sendApp: boolean;
      }) => {
        const response = await defaultApiFetcher.post(
          'users/send-ledger-email',
          {
            ...payload,
            ledgerEntry: cleanFalsyValues(
              convertParamsByMapping(payload.ledgerEntry)
            )
          }
        );
        return response;
      },
      {
        pending: (state) => {
          state.sending = true;
        },
        fulfilled: (state) => {
          state.sending = false;
        },
        rejected: (state) => {
          state.sending = false;
        }
      }
    ),
    getUserBalance: create.asyncThunk(
      async () => {
        const response = await defaultApiFetcher.get('users/balance');
        return response;
      },
      {
        pending: (state) => {
          state.balanceLoading = true;
        },
        fulfilled: (state, action) => {
          state.balanceLoading = false;
          if (action.payload?.success) {
            const { totalWithdraw = 0, totalDeposit = 0 } = action.payload.data;
            const currentTotalProfitLoss = state.totalProfitLoss;

            const balance =
              totalWithdraw > currentTotalProfitLoss
                ? totalDeposit + currentTotalProfitLoss - totalWithdraw
                : totalDeposit;

            state.userBalance = {
              totalWithdraw,
              totalDeposit,
              currentBalance: balance
            };

            state.initialBalance = balance;

            if (state.ledgerEntry.length > 0) {
              const { balanceMap, cumulativeMap } = computeLedgerBalances(
                state.ledgerEntry,
                state.initialBalance
              );
              state.balanceMap = balanceMap;
              state.cumulativeMap = cumulativeMap;
            }
          }
        },
        rejected: (state) => {
          state.balanceLoading = false;
        }
      }
    ),
    deposit: create.asyncThunk(
      async (payload: { amount: number; description?: string }) => {
        const response = await defaultApiFetcher.post(
          'users/balance/deposit',
          convertParamsByMapping(payload)
        );
        return response;
      },
      {
        pending: (state) => {
          state.processingBalance = true;
        },
        fulfilled: (state) => {
          state.processingBalance = false;
        },
        rejected: (state) => {
          state.processingBalance = false;
        }
      }
    ),

    withdraw: create.asyncThunk(
      async (payload: { amount: number; description?: string }) => {
        const response = await defaultApiFetcher.post(
          'users/balance/withdraw',
          convertParamsByMapping(payload)
        );
        return response;
      },
      {
        pending: (state) => {
          state.processingBalance = true;
        },
        fulfilled: (state) => {
          state.processingBalance = false;
        },
        rejected: (state) => {
          state.processingBalance = false;
        }
      }
    ),
    resetState: create.reducer((state) => {
      Object.assign(state, initialState);
    })
  }),

  selectors: {
    watchLedgerEntryLoading: (state) => state.loading,
    watchCreatingLedgerEntry: (state) => state.creating,
    watchUpdatingLedgerEntry: (state) => state.updating,
    watchSendingAlertLedger: (state) => state.sending,
    watchLedgerEntry: (state) => state.ledgerEntry,
    watchSelectedLedgerEntry: (state) => state.selectedEntry,
    watchBalanceMap: (state) => state.balanceMap,
    watchCumulativeMap: (state) => state.cumulativeMap,
    watchTotalProfitLoss: (state) => state.totalProfitLoss,
    watchInitialBalance: (state) => state.initialBalance,
    watchBalanceLoading: (state) => state.balanceLoading,
    watchUserBalance: (state) => state.userBalance,
    watchProcessingBalance: (state) => state.processingBalance
  }
});

export const {
  watchLedgerEntryLoading,
  watchCreatingLedgerEntry,
  watchUpdatingLedgerEntry,
  watchSendingAlertLedger,
  watchLedgerEntry,
  watchSelectedLedgerEntry,
  watchBalanceMap,
  watchCumulativeMap,
  watchTotalProfitLoss,
  watchInitialBalance,
  watchBalanceLoading,
  watchUserBalance,
  watchProcessingBalance
} = ledgerEntrySlice.selectors;

export const {
  getLedgerEntry,
  getLedgerEntryById,
  updateLedgerEntry,
  deleteLedgerEntry,
  createLedgerEntry,
  sendAlertLedger,
  resetState,
  getUserBalance,
  deposit,
  withdraw
} = ledgerEntrySlice.actions;
