import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { persistReducer } from 'redux-persist';
import APILogin from "../../../services/Login";

export const onSubmitAutSlice = createAsyncThunk('authToken/login', async (_, thunkAPI) => {

  const { email, password } = thunkAPI.getState().auth;

  try {
    const response = await APILogin.login({ email, password });

    return response; // Ubah sesuai dengan struktur respons API
  } catch (error) {
    throw error; // Lepaskan kembali kesalahan untuk ditangkap oleh .catch()
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authToken: "",
    user: [],
    rememberMe: false,
  },
  reducers: {
    handleAuth: (state, action) => {
      state.authToken = action.payload.authToken;
      state.user = action.payload.user
    }
  },
  extraReducers: (builder) => {

  }
});

export const { handleAuth } = authSlice.actions;
export default authSlice.reducer;

const authPersistConfig = {
  key: 'authSlice',
  storage: AsyncStorage,
  blacklist: [], // Mengecualikan state 'interval' dari disimpan di local storage
};

export const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer);
