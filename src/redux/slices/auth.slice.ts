import Cookies from 'js-cookie';
import { createAppSlice } from '../createAppSlice';
import { defaultApiFetcher } from '@/utils/api-instances';
import { AppThunk } from '../store';

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
          state.loading = false;
        },
        fulfilled: (state, action) => {
          state.profileLoading = false;
          state.isAuthenticated = true;
          state.user = {
            id: action.payload.id,
            username: action.payload.username,
            fullname: action.payload.fullname,
            phone: action.payload.phone,
            email: action.payload.email,
            role: action.payload.role,
            createdDate: action.payload.createdate,
            dateOfBirth: action.payload.birthdate
          };
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
          state.user = {
            id: action.payload.id,
            username: action.payload.username,
            fullname: action.payload.fullname
          };
        },
        rejected: (state) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.user = undefined;
        }
      }
    ),
    registerUser: create.asyncThunk(
      async (userData: RegisterUserParams) => {
        const response = await defaultApiFetcher.post('users', userData);
        return response.data;
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = {
            id: action.payload.id,
            username: action.payload.username,
            fullname: action.payload.fullname
          };
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

export const { getProfileUser, loginUser, registerUser } = authSlice.actions;

export const registerAndLogin =
  (userData: RegisterUserParams): AppThunk =>
  async (dispatch) => {
    const userInfo = await dispatch(registerUser(userData)).unwrap();
    await dispatch(
      loginUser({
        username: userInfo.username,
        password: userInfo.password
      })
    );
  };
