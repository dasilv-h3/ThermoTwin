import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../services/api';
import {
  AuthUser,
  deleteAccount as deleteAccountApi,
  fetchMe,
  login as loginApi,
  register as registerApi,
  RegisterPayload,
  updateNotifications as updateNotificationsApi,
  UpdateNotificationsPayload,
  updateProfile as updateProfileApi,
  UpdateProfilePayload,
} from '../services/authService';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }) => {
    const tokens = await loginApi(payload.email, payload.password);
    await setTokens(tokens.access_token, tokens.refresh_token);
    const user = await fetchMe();
    return { token: tokens.access_token, user };
  },
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload) => {
    const tokens = await registerApi(payload);
    await setTokens(tokens.access_token, tokens.refresh_token);
    const user = await fetchMe();
    return { token: tokens.access_token, user };
  },
);

export const hydrateThunk = createAsyncThunk('auth/hydrate', async () => {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  if (!accessToken || !refreshToken) {
    await clearTokens();
    return null;
  }
  try {
    const user = await fetchMe();
    return { token: accessToken, user };
  } catch {
    await clearTokens();
    return null;
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await clearTokens();
});

export const updateProfileThunk = createAsyncThunk(
  'auth/updateProfile',
  async (payload: UpdateProfilePayload) => {
    return await updateProfileApi(payload);
  },
);

export const updateNotificationsThunk = createAsyncThunk(
  'auth/updateNotifications',
  async (payload: UpdateNotificationsPayload) => {
    return await updateNotificationsApi(payload);
  },
);

export const deleteAccountThunk = createAsyncThunk('auth/deleteAccount', async () => {
  await deleteAccountApi();
  await clearAccessToken();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleAuthSuccess = (
      state: AuthState,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.status = 'idle';
      state.error = null;
    };

    const handleUserUpdate = (state: AuthState, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.status = 'idle';
      state.error = null;
    };

    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, handleAuthSuccess)
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Login failed';
      })

      .addCase(registerThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, handleAuthSuccess)
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Registration failed';
      })

      .addCase(hydrateThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(updateProfileThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, handleUserUpdate)
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Update failed';
      })

      .addCase(updateNotificationsThunk.fulfilled, handleUserUpdate)

      .addCase(deleteAccountThunk.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
