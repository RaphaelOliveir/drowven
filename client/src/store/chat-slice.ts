import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../api/axios-instance';

export const fetchUsers = createAsyncThunk(
  'chat/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users');
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed request');
    }
  }
);

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/conversations');
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/conversations/${conversationId}/messages`);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: { conversationId: string, content: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/conversations/${payload.conversationId}/messages`, {
        content: payload.content
      });
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const createOrGetConversation = createAsyncThunk(
  'chat/createOrGetConversation',
  async (targetUserId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/conversations', { targetUserId });
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to create conversation');
    }
  }
);

export interface User { id: string; name: string; email?: string; }
export interface Conversation { id: string; receiver_name?: string; [key: string]: unknown; }
export interface Message { id: string; content: string; [key: string]: unknown; }

const initialState = {
  users: [] as User[],
  conversations: [] as Conversation[],
  activeConversation: null as Conversation | null,
  messages: [] as Message[],
  loadingUsers: false,
  loadingConversations: false,
  loadingMessages: false,
  error: null as string | null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation(state, action) {
      state.activeConversation = action.payload;
      state.messages = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loadingUsers = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = action.payload as string;
      })
      .addCase(fetchConversations.pending, (state) => { state.loadingConversations = true; })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loadingConversations = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loadingConversations = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMessages.pending, (state) => { state.loadingMessages = true; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(createOrGetConversation.fulfilled, (state, action) => {
        const conv = action.payload;
        if (!state.conversations.find(c => c.id === conv.id)) {
          state.conversations.push(conv);
        }
        state.activeConversation = conv;
      });
  }
});

export const { setActiveConversation } = chatSlice.actions;
export default chatSlice.reducer;
