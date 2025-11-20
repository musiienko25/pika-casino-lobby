/**
 * Redux slice for managing categories state
 * Using plain Redux (not Redux Toolkit)
 */

import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { fetchConfig } from '@/services/api';
import type { Category } from '@/types';

// Forward declaration for RootState (will be defined in store.ts)
type RootState = { games: unknown; categories: CategoriesState };

// Action Types
export const CATEGORIES_ACTION_TYPES = {
  // Sync actions
  SET_CATEGORIES: 'categories/SET_CATEGORIES',
  SET_SELECTED_CATEGORY: 'categories/SET_SELECTED_CATEGORY',
  CLEAR_ERROR: 'categories/CLEAR_ERROR',
  // Async actions
  FETCH_CATEGORIES_PENDING: 'categories/FETCH_CATEGORIES_PENDING',
  FETCH_CATEGORIES_FULFILLED: 'categories/FETCH_CATEGORIES_FULFILLED',
  FETCH_CATEGORIES_REJECTED: 'categories/FETCH_CATEGORIES_REJECTED',
} as const;

// State interface
export interface CategoriesState {
  items: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
}

// Action interfaces
interface SetCategoriesAction {
  type: typeof CATEGORIES_ACTION_TYPES.SET_CATEGORIES;
  payload: Category[];
}

interface SetSelectedCategoryAction {
  type: typeof CATEGORIES_ACTION_TYPES.SET_SELECTED_CATEGORY;
  payload: Category | null;
}

interface ClearErrorAction {
  type: typeof CATEGORIES_ACTION_TYPES.CLEAR_ERROR;
}

interface FetchCategoriesPendingAction {
  type: typeof CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_PENDING;
}

interface FetchCategoriesFulfilledAction {
  type: typeof CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_FULFILLED;
  payload: Category[];
}

interface FetchCategoriesRejectedAction {
  type: typeof CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_REJECTED;
  payload: string;
}

export type CategoriesAction =
  | SetCategoriesAction
  | SetSelectedCategoryAction
  | ClearErrorAction
  | FetchCategoriesPendingAction
  | FetchCategoriesFulfilledAction
  | FetchCategoriesRejectedAction
  | { type: string; [key: string]: unknown }; // Index signature for compatibility

// Initial state
const initialState: CategoriesState = {
  items: [],
  selectedCategory: null,
  loading: false,
  error: null,
};

// Action Creators (Sync)
export const setCategories = (categories: Category[]): SetCategoriesAction => ({
  type: CATEGORIES_ACTION_TYPES.SET_CATEGORIES,
  payload: categories,
});

export const setSelectedCategory = (
  category: Category | null
): SetSelectedCategoryAction => ({
  type: CATEGORIES_ACTION_TYPES.SET_SELECTED_CATEGORY,
  payload: category,
});

export const clearError = (): ClearErrorAction => ({
  type: CATEGORIES_ACTION_TYPES.CLEAR_ERROR,
});

// Action Creators (Async) - using redux-thunk
type CategoriesThunkAction = ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  CategoriesAction
>;

export const fetchCategories = (): CategoriesThunkAction => {
  return async (
    dispatch: ThunkDispatch<RootState, unknown, CategoriesAction>
  ) => {
    dispatch({ type: CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_PENDING } as CategoriesAction);
    try {
      const categories = await fetchConfig();
      dispatch({
        type: CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_FULFILLED,
        payload: categories,
      } as FetchCategoriesFulfilledAction);
    } catch (error) {
      dispatch({
        type: CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_REJECTED,
        payload: error instanceof Error ? error.message : 'Failed to fetch categories',
      } as FetchCategoriesRejectedAction);
    }
  };
};

// Reducer
export default function categoriesReducer(
  state: CategoriesState = initialState,
  action: CategoriesAction
): CategoriesState {
  switch (action.type) {
    case CATEGORIES_ACTION_TYPES.SET_CATEGORIES: {
      const typedAction = action as SetCategoriesAction;
      return {
        ...state,
        items: typedAction.payload,
        selectedCategory:
          typedAction.payload.length > 0 && !state.selectedCategory
            ? typedAction.payload[0]
            : state.selectedCategory,
      };
    }

    case CATEGORIES_ACTION_TYPES.SET_SELECTED_CATEGORY: {
      const typedAction = action as SetSelectedCategoryAction;
      return {
        ...state,
        selectedCategory: typedAction.payload,
      };
    }

    case CATEGORIES_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_PENDING:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_FULFILLED: {
      const typedAction = action as FetchCategoriesFulfilledAction;
      return {
        ...state,
        loading: false,
        items: typedAction.payload,
        selectedCategory:
          typedAction.payload.length > 0 && !state.selectedCategory
            ? typedAction.payload[0]
            : state.selectedCategory,
      };
    }

    case CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_REJECTED: {
      const typedAction = action as FetchCategoriesRejectedAction;
      return {
        ...state,
        loading: false,
        error: typedAction.payload,
      };
    }

    default:
      return state;
  }
}
