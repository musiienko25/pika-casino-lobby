/**
 * Redux store factory for SSR
 * Creates a new store instance for each request
 */

import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from './slices/gamesSlice';
import categoriesReducer from './slices/categoriesSlice';
import type { Category } from '@/types';

export function makeStore(preloadedState?: {
  categories?: { items: Category[]; selectedCategory: Category | null };
}) {
  return configureStore({
    reducer: {
      games: gamesReducer,
      categories: categoriesReducer,
    },
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

