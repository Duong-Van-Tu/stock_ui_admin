import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { transformStockDetails } from '@/helpers/stock-details.helper';

export type StockDetailsState = {
  loading: boolean;
  stockDetails: StockDetails | null;
};

const initialState: StockDetailsState = {
  loading: false,
  stockDetails: null
};

export const stockDetailsSlice = createAppSlice({
  name: 'stock-details',
  initialState,
  reducers: (create) => ({
    getStockDetails: create.asyncThunk(
      async (symbol: string) => {
        const response = await defaultApiFetcher.get(
          `stock-scores/detail/${symbol}`
        );
        return response.data[0];
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.stockDetails = transformStockDetails(action.payload);
        },
        rejected: (state) => {
          state.loading = false;
          state.stockDetails = null;
        }
      }
    )
  }),

  selectors: {
    watchStockDetailsLoading: (stock) => stock.loading,
    watchStockDetails: (stock) => stock.stockDetails
  }
});

export const { watchStockDetailsLoading, watchStockDetails } =
  stockDetailsSlice.selectors;

export const { getStockDetails } = stockDetailsSlice.actions;
