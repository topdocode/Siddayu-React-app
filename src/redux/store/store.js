import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import rootReducer from './rootReducer';
import thunk from 'redux-thunk';

// const expireTransform = createTransform(
//   (inboundState) => inboundState,

//   (outboundState, key) => {
//     const currentTime = new Date();
//     const expireTime = new Date(outboundState.expireTime);

//     // Bandingkan waktu saat ini dengan waktu kedaluwarsa
//     if (currentTime >= expireTime) {
//       // Data telah kedaluwarsa, jadi kembalikan objek kosong
//       return {};
//     }
//     return outboundState;
//   }
// )

const persistConfig = {
  key: 'root',
  storage: AsyncStorage, // local storage
  blacklist: ['timestamp', 'auth'],
  // transforms: [expireTransform]
  transforms: []
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
});

export const persistor = persistStore(store);