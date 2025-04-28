import { defaultApiFetcher } from '@/utils/api-instances';
import { createAppSlice } from '../createAppSlice';
import { convertParamsByMapping } from '@/utils/common';
import { transformNote } from '@/helpers/note.helper';

export type NoteState = {
  note: Note | null;
  loading: boolean;
};

const initialState: NoteState = {
  note: null,
  loading: false
};

export const notesSlice = createAppSlice({
  name: 'notes',
  initialState,
  reducers: (create) => ({
    getNoteBySignal: create.asyncThunk(
      async (params: NoteParams) => {
        const data = await defaultApiFetcher.get('page-notes/detail', {
          query: convertParamsByMapping(params)
        });
        return data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.note = transformNote(action.payload);
        },
        rejected: (state) => {
          state.loading = false;
          state.note = null;
        }
      }
    ),
    updateNoteBySignal: create.asyncThunk(
      async (params: NoteParams) => {
        const data = await defaultApiFetcher.post(
          'page-notes/upsert-note',
          params
        );
        return data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          if (action.payload) {
            state.note = transformNote(action.payload);
          }
        },
        rejected: (state) => {
          state.loading = false;
        }
      }
    )
  }),

  selectors: {
    watchNote: (state) => state.note,
    watchNodeLoading: (state) => state.loading
  }
});

export const { watchNote, watchNodeLoading } = notesSlice.selectors;

export const { getNoteBySignal, updateNoteBySignal } = notesSlice.actions;
