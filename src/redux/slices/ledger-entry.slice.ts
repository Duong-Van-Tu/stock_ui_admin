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
  ledgerEntry: LedgerEntry[];
  balanceMap: Record<string, number>;
  cumulativeMap: Record<string, number>;
  selectedEntry: LedgerEntry | null;
};

const initialState: ledgerEntryState = {
  loading: false,
  ledgerEntry: [],
  selectedEntry: null,
  balanceMap: {},
  cumulativeMap: {},
  updating: false
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
    )
  }),

  selectors: {
    watchLedgerEntryLoading: (state) => state.loading,
    watchUpdatingLedgerEntry: (state) => state.updating,
    watchLedgerEntry: (state) => state.ledgerEntry,
    watchSelectedLedgerEntry: (state) => state.selectedEntry,
    watchBalanceMap: (state) => state.balanceMap,
    watchCumulativeMap: (state) => state.cumulativeMap
  }
});

export const {
  watchLedgerEntryLoading,
  watchUpdatingLedgerEntry,
  watchLedgerEntry,
  watchSelectedLedgerEntry,
  watchBalanceMap,
  watchCumulativeMap
} = ledgerEntrySlice.selectors;

export const { getLedgerEntry, getLedgerEntryById, updateLedgerEntry } =
  ledgerEntrySlice.actions;
