/**
 * Redux store factory for SSR
 * Creates a new store instance for each request
 * Using plain Redux (not Redux Toolkit)
 */

import { createStore, combineReducers, applyMiddleware, type Store, type AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const thunk = require('redux-thunk').thunk;
import gamesReducer from './slices/gamesSlice';
import categoriesReducer from './slices/categoriesSlice';
import type { GamesState } from './slices/gamesSlice';
import type { CategoriesState } from './slices/categoriesSlice';

// Root state type
export interface RootState {
  games: GamesState;
  categories: CategoriesState;
}

// Root reducer
const rootReducer = combineReducers({
  games: gamesReducer,
  categories: categoriesReducer,
});

// Store type
export type AppStore = Store<RootState, AnyAction>;
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// Deep partial type for preloaded state
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Create store factory
export function makeStore(preloadedState?: DeepPartial<RootState>): AppStore {
  // Convert DeepPartial to RootState for preloadedState
  const initialState = preloadedState as RootState | undefined;

  return createStore(rootReducer, initialState, applyMiddleware(thunk));
}
