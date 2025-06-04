import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  computeLedgerBalances,
  transformLedgerEntry
} from '@/helpers/ledger-entry.helper';
import { convertParamsByMapping } from '@/utils/common';

export type ledgerEntryState = {
  loading: boolean;
  updating: boolean;
  creating: boolean;
  ledgerEntry: LedgerEntry[];
  balanceMap: Record<string, number>;
  cumulativeMap: Record<string, number>;
  selectedEntry: LedgerEntry | null;
};

const initialState: ledgerEntryState = {
  loading: false,
  updating: false,
  creating: false,
  selectedEntry: null,
  ledgerEntry: [],
  balanceMap: {},
  cumulativeMap: {}
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
          const { balanceMap, cumulativeMap } =
            computeLedgerBalances(transformedEntries);

          state.ledgerEntry = transformedEntries;
          state.balanceMap = balanceMap;
          state.cumulativeMap = cumulativeMap;
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
            const { balanceMap, cumulativeMap } =
              computeLedgerBalances(updatedEntries);

            state.ledgerEntry = updatedEntries;
            state.balanceMap = balanceMap;
            state.cumulativeMap = cumulativeMap;
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
          const { balanceMap, cumulativeMap } = computeLedgerBalances(
            state.ledgerEntry
          );
          state.balanceMap = balanceMap;
          state.cumulativeMap = cumulativeMap;
        },
        rejected: (state) => {
          state.updating = false;
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
    watchLedgerEntry: (state) => state.ledgerEntry,
    watchSelectedLedgerEntry: (state) => state.selectedEntry,
    watchBalanceMap: (state) => state.balanceMap,
    watchCumulativeMap: (state) => state.cumulativeMap
  }
});

export const {
  watchLedgerEntryLoading,
  watchCreatingLedgerEntry,
  watchUpdatingLedgerEntry,
  watchLedgerEntry,
  watchSelectedLedgerEntry,
  watchBalanceMap,
  watchCumulativeMap
} = ledgerEntrySlice.selectors;

export const {
  getLedgerEntry,
  getLedgerEntryById,
  updateLedgerEntry,
  deleteLedgerEntry,
  createLedgerEntry,
  resetState
} = ledgerEntrySlice.actions;
