import { PAGINATION } from '@/constants/pagination.constant';
import { convertParamsByMapping } from '@/utils/common';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import {
  transformEstForecast,
  transformEstForecastFilter
} from '@/helpers/est-forecast.helper';

export type EstForecastState = {
  loading: boolean;
  submitting: boolean;
  deleting: boolean;
  list: EstForecast[];
  filterList: EstForecastFilterItem[];
  pagination: Pagination;
  detail?: EstForecast | null;
};

const initialState: EstForecastState = {
  loading: false,
  submitting: false,
  deleting: false,
  list: [],
  filterList: [],
  pagination: PAGINATION,
  detail: null
};

export const estForecastSlice = createAppSlice({
  name: 'est-forecast',
  initialState,
  reducers: (create) => ({
    getEstForecastFilter: create.asyncThunk(
      async (query?: { symbol?: string }) => {
        const response = await defaultApiFetcher.get(
          'est-forecast/view-filter',
          { query }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.list = transformEstForecast(action.payload || []);
        },
        rejected: (state) => {
          state.loading = false;
          state.list = [];
        }
      }
    ),

    getEstForecastFilterPaging: create.asyncThunk(
      async (query?: Record<string, any>) => {
        const response = await defaultApiFetcher.get('est-forecast/filter', {
          query: convertParamsByMapping(query || {})
        });
        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.filterList = transformEstForecastFilter(
            action.payload.result || []
          ) as EstForecastFilterItem[];
          state.pagination = {
            currentPage: action.payload.currentPage,
            pageSize: action.payload.limit,
            total: Number(action.payload.totalResult)
          };
        },
        rejected: (state) => {
          state.loading = false;
          state.filterList = [];
          state.pagination = PAGINATION;
        }
      }
    ),

    addEstForecast: create.asyncThunk(
      async (payload: EstForecast) => {
        const response = await defaultApiFetcher.post(
          'est-forecast',
          convertParamsByMapping(payload)
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.submitting = true;
        },
        fulfilled: (state) => {
          state.submitting = false;
        },
        rejected: (state) => {
          state.submitting = false;
        }
      }
    ),

    getEstForecastDetail: create.asyncThunk(
      async (id: number) => {
        const response = await defaultApiFetcher.get(`est-forecast/${id}`);
        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
          state.detail = null;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.detail = action.payload;
        },
        rejected: (state) => {
          state.loading = false;
          state.detail = null;
        }
      }
    ),

    updateEstForecast: create.asyncThunk(
      async ({ id, payload }: { id: number; payload: EstForecast }) => {
        const response = await defaultApiFetcher.put(
          `est-forecast/${id}`,
          convertParamsByMapping(payload)
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.submitting = true;
        },
        fulfilled: (state, action) => {
          state.submitting = false;
          if (action.payload) {
            const [updated] = transformEstForecast([action.payload]);
            state.list = state.list.map((item) =>
              item.id === updated.id ? updated : item
            );
            state.detail = updated;
          }
        },
        rejected: (state) => {
          state.submitting = false;
        }
      }
    ),

    deleteEstForecast: create.asyncThunk(
      async (id: number) => {
        await defaultApiFetcher.delete(`est-forecast/${id}`);
        return id;
      },
      {
        pending: (state) => {
          state.deleting = true;
        },
        fulfilled: (state, action) => {
          state.deleting = false;
          state.list = state.list.filter((item) => item.id !== action.payload);
          state.filterList = state.filterList.filter(
            (item) => item.id !== action.payload
          );
          state.pagination.total = Math.max(0, state.pagination.total - 1);
          if (state.detail?.id === action.payload) {
            state.detail = null;
          }
        },
        rejected: (state) => {
          state.deleting = false;
        }
      }
    ),

    resetState: create.reducer((state) => {
      Object.assign(state, initialState);
    })
  }),

  selectors: {
    watchEstForecastLoading: (state) => state.loading,
    watchEstForecastSubmitting: (state) => state.submitting,
    watchEstForecastDeleting: (state) => state.deleting,
    watchEstForecastList: (state) => state.list,
    watchEstForecastFilterList: (state) => state.filterList,
    watchEstForecastPagination: (state) => state.pagination,
    watchEstForecastDetail: (state) => state.detail
  }
});

export const {
  watchEstForecastLoading,
  watchEstForecastSubmitting,
  watchEstForecastDeleting,
  watchEstForecastList,
  watchEstForecastFilterList,
  watchEstForecastPagination,
  watchEstForecastDetail
} = estForecastSlice.selectors;

export const {
  getEstForecastFilter,
  getEstForecastFilterPaging,
  addEstForecast,
  getEstForecastDetail,
  updateEstForecast,
  deleteEstForecast,
  resetState
} = estForecastSlice.actions;
