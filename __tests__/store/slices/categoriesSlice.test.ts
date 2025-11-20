/**
 * Unit tests for categories slice
 */

import categoriesReducer, {
  setCategories,
  setSelectedCategory,
  clearError,
  CATEGORIES_ACTION_TYPES,
} from '@/store/slices/categoriesSlice';
import type { Category } from '@/types';

// Mock the API service
jest.mock('@/services/api', () => ({
  fetchConfig: jest.fn(),
}));

describe('categoriesSlice', () => {
  const mockCategories: Category[] = [
    { id: '1', name: 'Slots', getPage: '/en/games/slots' },
    { id: '2', name: 'Table Games', getPage: '/en/games/table' },
  ];

  const initialState = {
    items: [],
    selectedCategory: null,
    loading: false,
    error: null,
  };

  it('should return initial state', () => {
    expect(categoriesReducer(undefined, { type: 'unknown' })).toEqual(
      initialState
    );
  });

  it('should handle setCategories', () => {
    const action = setCategories(mockCategories);
    const state = categoriesReducer(initialState, action);

    expect(state.items).toEqual(mockCategories);
    expect(state.selectedCategory).toEqual(mockCategories[0]);
  });

  it('should handle setSelectedCategory', () => {
    const state = categoriesReducer(
      { ...initialState, items: mockCategories },
      setSelectedCategory(mockCategories[1])
    );

    expect(state.selectedCategory).toEqual(mockCategories[1]);
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' };
    const state = categoriesReducer(stateWithError, clearError());

    expect(state.error).toBeNull();
  });

  describe('fetchCategories async thunk', () => {
    it('should handle pending state', () => {
      const action = { type: CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_PENDING };
      const state = categoriesReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const action = {
        type: CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_FULFILLED,
        payload: mockCategories,
      };
      const state = categoriesReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.items).toEqual(mockCategories);
      expect(state.selectedCategory).toEqual(mockCategories[0]);
    });

    it('should handle rejected state', () => {
      const errorMessage = 'Failed to fetch';
      const action = {
        type: CATEGORIES_ACTION_TYPES.FETCH_CATEGORIES_REJECTED,
        payload: errorMessage,
      };
      const state = categoriesReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });
});

