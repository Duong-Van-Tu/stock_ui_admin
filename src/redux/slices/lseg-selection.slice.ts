import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { transformLsegSelection } from '@/helpers/lseg-selection.helper';

export type LsegSelectionState = {
  loading: boolean;
  list: LsegSelection[];
  pagination: Pagination;
};

const initialState: LsegSelectionState = {
  loading: false,
  list: [],
  pagination: {
    total: 0,
    currentPage: 1,
    pageSize: 100
  }
};

export const lsegSelectionSlice = createAppSlice({
  name: 'lseg-selection',
  initialState,
  reducers: (create) => ({
    getLsegSelection: create.asyncThunk(
      async (query?: LsegSelectionFilter) => {
        const response = await defaultApiFetcher.get('lseg-selection', {
          query
        });
        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.list = transformLsegSelection(action.payload.items);
          state.pagination = {
            currentPage: action.payload.page,
            pageSize: action.payload.limit,
            total: Number(action.payload.total)
          };
        },
        rejected: (state) => {
          state.loading = false;
          state.list = [];
          state.pagination = {
            total: 0,
            currentPage: 1,
            pageSize: 100
          };
        }
      }
    ),
    resetState: create.reducer((state) => {
      Object.assign(state, initialState);
    })
  }),
  selectors: {
    watchLsegSelectionLoading: (state) => state.loading,
    watchLsegSelectionList: (state) => state.list,
    watchLsegSelectionPagination: (state) => state.pagination
  }
});

export const {
  watchLsegSelectionLoading,
  watchLsegSelectionList,
  watchLsegSelectionPagination
} = lsegSelectionSlice.selectors;

export const { getLsegSelection, resetState } = lsegSelectionSlice.actions;
