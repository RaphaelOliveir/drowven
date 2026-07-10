import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../api/axios-instance';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
  description?: string;
  projects?: string;
  experience?: string;
  areas?: string[];
}

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ id, data }: { id: string, data: Record<string, any> }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/users/${id}`, data);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user && state.user.id === action.payload.id) {
          state.user = action.payload;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('token');
        state.error = action.payload as string;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
