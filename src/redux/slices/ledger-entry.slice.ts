import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { transformLedgerEntry } from '@/helpers/ledger-entry.helper';

export type ledgerEntryState = {
  loading: boolean;
  ledgerEntry: LedgerEntry[];
};

const initialState: ledgerEntryState = {
  loading: false,
  ledgerEntry: []
};

export const ledgerEntrySlice = createAppSlice({
  name: 'ledger-entry',
  initialState,
  reducers: (create) => ({
    getLedgerEntry: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get('ledger-entry', {
          query
        });
        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.ledgerEntry = transformLedgerEntry(action.payload);
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
    watchLedgerEntry: (state) => state.ledgerEntry
  }
});

export const { watchLedgerEntryLoading, watchLedgerEntry } =
  ledgerEntrySlice.selectors;

export const { getLedgerEntry } = ledgerEntrySlice.actions;
