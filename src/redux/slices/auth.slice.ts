import Cookies from 'js-cookie';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';

export type AuthSliceState = {
  loading: boolean;
  profileLoading: boolean;
  isAuthenticated: boolean;
  user?: User;
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
        const response = await defaultApiFetcher.get('users/profile');

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
    ),
    loginUser: create.asyncThunk(
      async (credentials: LoginUserParams) => {
        const response = await defaultApiFetcher.post(
          'users/login',
          credentials
        );

        Cookies.set('access_token', response.data.accesstoken, { expires: 7 });

        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = action.payload;
        },
        rejected: (state) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.user = undefined;
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

export const { getProfileUser, loginUser } = authSlice.actions;
