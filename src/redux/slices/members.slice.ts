import { transformMembers } from '@/helpers/member.helper';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { convertParamsByMapping } from '@/utils/common';

export type membersState = {
  loading: boolean;
  members: Member[];
};

const initialState: membersState = {
  loading: false,
  members: []
};

export const membersSlice = createAppSlice({
  name: 'members',
  initialState,
  reducers: (create) => ({
    getMembers: create.asyncThunk(
      async (params?: Record<string, any>) => {
        const response = await defaultApiFetcher.get('users/list-user-email', {
          query: params ? convertParamsByMapping(params) : {}
        });
        return response;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.members = transformMembers(action.payload.data);
        },
        rejected: (state) => {
          state.loading = false;
          state.members = [];
        }
      }
    ),

    resetState: create.reducer((state) => {
      Object.assign(state, initialState);
    })
  }),

  selectors: {
    watchMembersLoading: (state) => state.loading,
    watchMembers: (state) => state.members
  }
});

export const { watchMembersLoading, watchMembers } = membersSlice.selectors;

export const { getMembers, resetState } = membersSlice.actions;
