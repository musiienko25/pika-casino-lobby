/**
 * Redux store factory for SSR
 * Creates a new store instance for each request
 */

import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from './slices/gamesSlice';
import categoriesReducer from './slices/categoriesSlice';

// Create a temporary store instance to infer types
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const store = configureStore({
  reducer: {
    games: gamesReducer,
    categories: categoriesReducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function makeStore(preloadedState?: DeepPartial<RootState>) {
  return configureStore({
    reducer: {
      games: gamesReducer,
      categories: categoriesReducer,
    },
    preloadedState: preloadedState as RootState | undefined,
  });
}

