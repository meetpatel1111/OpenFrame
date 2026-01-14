import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/appSlice';
import mediaSlice from './slices/mediaSlice';
import librarySlice from './slices/librarySlice';
import converterSlice from './slices/converterSlice';
import recorderSlice from './slices/recorderSlice';

export const store = configureStore({
  reducer: {
    app: appSlice,
    media: mediaSlice,
    library: librarySlice,
    converter: converterSlice,
    recorder: recorderSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['media/setCurrentMedia'],
        ignoredPaths: ['media.currentMedia'],
      },
    }),
});

export { store };
