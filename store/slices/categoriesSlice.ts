/**
 * Redux slice for managing categories state
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchConfig } from '@/services/api';
import type { Category } from '@/types';

interface CategoriesState {
  items: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  selectedCategory: null,
  loading: false,
  error: null,
};

/**
 * Async thunk to fetch categories from API
 */
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await fetchConfig();
      return categories;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch categories'
      );
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    /**
     * Set categories directly (for SSR/hydration)
     */
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.items = action.payload;
      if (action.payload.length > 0 && !state.selectedCategory) {
        state.selectedCategory = action.payload[0];
      }
    },
    /**
     * Set the selected category
     */
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        // Auto-select first category if available and none is selected
        if (action.payload.length > 0 && !state.selectedCategory) {
          state.selectedCategory = action.payload[0];
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCategories, setSelectedCategory, clearError } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;

