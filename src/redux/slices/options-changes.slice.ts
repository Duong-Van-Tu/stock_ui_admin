import { PAGINATION } from '@/constants/pagination.constant';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { transformOptionChangesData } from '@/helpers/options-changes.helper';

export type OptionChangesState = {
  loading: boolean;
  data: OptionChange[];
  pagination: Pagination;
};

const initialState: OptionChangesState = {
  loading: false,
  data: [],
  pagination: PAGINATION
};

export const optionChangesSlice = createAppSlice({
  name: 'option-changes',
  initialState,
  reducers: (create) => ({
    getOptionChanges: create.asyncThunk(
      async (body?: Record<string, any>) => {
        const response = await defaultApiFetcher.post(
          'option-changes/filter',
          body
        );

        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.data = transformOptionChangesData(action.payload.result);
          state.pagination = {
            currentPage: action.payload.offset,
            pageSize: action.payload.limit,
            total: Number(action.payload.total)
          };
        },
        rejected: (state) => {
          state.loading = false;
          state.data = [];
          state.pagination = PAGINATION;
        }
      }
    ),

    resetOptionChanges: create.reducer((state) => {
      Object.assign(state, initialState);
    })
  }),

  selectors: {
    watchOptionChangesLoading: (state) => state.loading,
    watchOptionChangesData: (state) => state.data,
    watchOptionChangesPagination: (state) => state.pagination
  }
});

export const { getOptionChanges, resetOptionChanges } =
  optionChangesSlice.actions;

export const {
  watchOptionChangesLoading,
  watchOptionChangesData,
  watchOptionChangesPagination
} = optionChangesSlice.selectors;
