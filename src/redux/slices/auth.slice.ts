import { createAppSlice } from '../createAppSlice';

export type AuthSliceState = {
  loading: boolean;
  profileLoading: boolean;
  isAuthenticated: boolean;
};

const initialState: AuthSliceState = {
  loading: false,
  profileLoading: true,
  isAuthenticated: false
};

export const authSlice = createAppSlice({
  name: 'auth',
  initialState,
  reducers: (create) => ({
    getProfileUser: create.asyncThunk(
      async () => {
        const response = await apiFetcher.get('users/profile');
        return response.data;
      },
      {
        pending: (state) => {
          state.profileLoading = true;
        },
        fulfilled: (state) => {
          state.profileLoading = false;
          state.isAuthenticated = true;
        },
        rejected: (state) => {
          state.profileLoading = false;
          state.isAuthenticated = false;
        }
      }
    )
  }),

  selectors: {
    watchAuthLoading: (auth) => auth.loading,
    watchProfileLoading: (auth) => auth.profileLoading,
    watchLoggedIn: (auth) => auth.isAuthenticated
  }
});

export const { watchLoggedIn, watchAuthLoading, watchProfileLoading } =
  authSlice.selectors;

export const { getProfileUser } = authSlice.actions;
