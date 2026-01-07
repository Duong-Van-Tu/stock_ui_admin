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
  listLoading: boolean;
  filterLoading: boolean;
  submitting: boolean;
  deleting: boolean;
  adding: boolean;
  addSuccess: boolean;
  lastAddedEarningsDate: string | null;
  list: EstForecast[];
  filterList: EstForecastFilterItem[];
  pagination: Pagination;
  detail?: EstForecastFilterItem | null;
  summary: CountByDate[];
};

const initialState: EstForecastState = {
  loading: false,
  listLoading: false,
  filterLoading: false,
  submitting: false,
  deleting: false,
  adding: false,
  addSuccess: false,
  lastAddedEarningsDate: null,
  list: [],
  filterList: [],
  pagination: PAGINATION,
  detail: null,
  summary: []
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
          state.listLoading = true;
        },
        fulfilled: (state, action) => {
          state.listLoading = false;
          state.list = transformEstForecast(action.payload || []);
        },
        rejected: (state) => {
          state.listLoading = false;
          state.list = [];
        }
      }
    ),

    getCountEstForecast: create.asyncThunk(
      async (query: { fromDate: string; toDate: string }) => {
        const response = await defaultApiFetcher.get(
          'est-forecast/get-count-by-date',
          { query }
        );
        return response.data;
      },
      {
        pending: (state) => {
          state.summary = [];
        },
        fulfilled: (state, action) => {
          state.summary = action.payload || [];
        },
        rejected: (state) => {
          state.summary = [];
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
          state.filterLoading = true;
        },
        fulfilled: (state, action) => {
          state.filterLoading = false;
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
          state.filterLoading = false;
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
          state.adding = true;
          state.addSuccess = false;
        },
        fulfilled: (state, action) => {
          state.adding = false;
          state.addSuccess = true;
          state.lastAddedEarningsDate = action.meta.arg.earningsDate;
        },
        rejected: (state) => {
          state.adding = false;
          state.addSuccess = false;
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
          state.detail = null;
        },
        fulfilled: (state, action) => {
          state.detail = action.payload;
        },
        rejected: (state) => {
          state.detail = null;
        }
      }
    ),

    updateEstForecast: create.asyncThunk(
      async ({
        id,
        payload
      }: {
        id: number;
        payload: EstForecastFilterItem;
      }) => {
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
            const [updatedFilterItem] = transformEstForecastFilter([
              action.payload
            ]);

            state.filterList = state.filterList.map((item) =>
              item.id === updatedFilterItem.id ? updatedFilterItem : item
            );

            state.detail = updatedFilterItem;
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

    resetAddEstForecastState: create.reducer((state) => {
      state.adding = false;
      state.addSuccess = false;
      state.lastAddedEarningsDate = null;
    }),

    resetState: create.reducer((state) => {
      Object.assign(state, initialState);
    })
  }),

  selectors: {
    watchEstForecastLoading: (state) => state.loading,
    watchEstForecastListLoading: (state) => state.listLoading,
    watchEstForecastFilterLoading: (state) => state.filterLoading,
    watchEstForecastSubmitting: (state) => state.submitting,
    watchEstForecastDeleting: (state) => state.deleting,
    watchEstForecastAdding: (state) => state.adding,
    watchEstForecastAddSuccess: (state) => state.addSuccess,
    watchEstForecastLastAddedEarningsDate: (state) =>
      state.lastAddedEarningsDate,
    watchEstForecastList: (state) => state.list,
    watchEstForecastFilterList: (state) => state.filterList,
    watchEstForecastPagination: (state) => state.pagination,
    watchEstForecastDetail: (state) => state.detail,
    watchEstForecastSummary: (state) => state.summary
  }
});

export const {
  watchEstForecastLoading,
  watchEstForecastListLoading,
  watchEstForecastFilterLoading,
  watchEstForecastSubmitting,
  watchEstForecastDeleting,
  watchEstForecastAdding,
  watchEstForecastAddSuccess,
  watchEstForecastLastAddedEarningsDate,
  watchEstForecastList,
  watchEstForecastFilterList,
  watchEstForecastPagination,
  watchEstForecastDetail,
  watchEstForecastSummary
} = estForecastSlice.selectors;

export const {
  getEstForecastFilter,
  getCountEstForecast,
  getEstForecastFilterPaging,
  addEstForecast,
  getEstForecastDetail,
  updateEstForecast,
  deleteEstForecast,
  resetAddEstForecastState,
  resetState
} = estForecastSlice.actions;
