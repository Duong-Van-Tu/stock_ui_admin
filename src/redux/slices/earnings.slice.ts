import { transformEarningsSummary } from '@/helpers/earnings.helper';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';

export type EarningsState = {
  loadingEarningsSummary: boolean;
  earningsSummary: EarningsSummary[];
};

const initialState: EarningsState = {
  loadingEarningsSummary: false,
  earningsSummary: []
};

export const earningsSlice = createAppSlice({
  name: 'earnings',
  initialState,
  reducers: (create) => ({
    getCountEarningsCalendar: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get(
          'stock-scores/get-count-earning-calender-nextdate',
          {
            query
          }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loadingEarningsSummary = true;
        },
        fulfilled: (state, action) => {
          state.loadingEarningsSummary = false;
          state.earningsSummary = transformEarningsSummary(action.payload);
        },
        rejected: (state) => {
          state.loadingEarningsSummary = false;
          state.earningsSummary = [];
        }
      }
    )
  }),

  selectors: {
    watchStockScoreLoading: (earning) => earning.loadingEarningsSummary,
    watchEarningsSummary: (earning) => earning.earningsSummary
  }
});

export const { watchStockScoreLoading, watchEarningsSummary } =
  earningsSlice.selectors;

export const { getCountEarningsCalendar } = earningsSlice.actions;
