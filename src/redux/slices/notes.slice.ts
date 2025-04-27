import { defaultApiFetcher } from '@/utils/api-instances';
import { createAppSlice } from '../createAppSlice';

export type SignalsState = {};

const initialState: SignalsState = {};

export const notesSlice = createAppSlice({
  name: 'signals',
  initialState,
  reducers: (create) => ({
    getNoteBySignal: create.asyncThunk(
      async (params: { page_name: string; symbol: string }) => {
        const response = await defaultApiFetcher.get('page-notes/detail', {
          query: params
        });
        return response.data;
      }
    )
  }),

  selectors: {}
});

export const {} = notesSlice.selectors;

export const {} = notesSlice.actions;
