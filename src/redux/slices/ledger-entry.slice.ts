import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  computeLedgerBalances,
  transformLedgerEntry
} from '@/helpers/ledger-entry.helper';
import { convertParamsByMapping } from '@/utils/common';

export type ledgerEntryState = {
  loading: boolean;
  ledgerEntry: LedgerEntry[];
  balanceMap: Record<string, number>;
  cumulativeMap: Record<string, number>;
};

const initialState: ledgerEntryState = {
  loading: false,
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
    )
  }),

  selectors: {
    watchLedgerEntryLoading: (state) => state.loading,
    watchLedgerEntry: (state) => state.ledgerEntry,
    watchBalanceMap: (state) => state.balanceMap,
    watchCumulativeMap: (state) => state.cumulativeMap
  }
});

export const {
  watchLedgerEntryLoading,
  watchLedgerEntry,
  watchBalanceMap,
  watchCumulativeMap
} = ledgerEntrySlice.selectors;

export const { getLedgerEntry } = ledgerEntrySlice.actions;
