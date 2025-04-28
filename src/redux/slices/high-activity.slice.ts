import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { transformListHighActivity } from '@/helpers/high-activity.helper';

export type HighActivityState = {
  loading: boolean;
  pagination: Pagination;
  listHighActivity: ListHighActivity[];
};

const initialState: HighActivityState = {
  loading: false,
  listHighActivity: [],
  pagination: PAGINATION
};

export const highActivitySlice = createAppSlice({
  name: 'high-activity',
  initialState,
  reducers: (create) => ({
    getListHighActivity: create.asyncThunk(
      async (query?: ListHighActivityFilter) => {
        const response = await defaultApiFetcher.get(
          'stock-scores/list-high-activity-stock',
          {
            query
          }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.listHighActivity = transformListHighActivity(
            action.payload.result
          );
          state.pagination = {
            currentPage: action.payload.offset,
            pageSize: action.payload.limit,
            total: Number(action.payload.total)
          };
        },
        rejected: (state) => {
          state.loading = false;
          state.listHighActivity = [];
          state.pagination = PAGINATION;
        }
      }
    )
  }),

  selectors: {
    watchListHighActivityLoading: (state) => state.loading,
    watchListHighActivity: (state) => state.listHighActivity,
    watchListHighActivityPagination: (state) => state.pagination
  }
});

export const {
  watchListHighActivityLoading,
  watchListHighActivity,
  watchListHighActivityPagination
} = highActivitySlice.selectors;

export const { getListHighActivity } = highActivitySlice.actions;
