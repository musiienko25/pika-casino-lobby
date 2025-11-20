/**
 * Redux slice for managing games state
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchGamesTiles, fetchCategoryGames } from '@/services/api';
import type { GameTile, GamesTilesParams } from '@/types';

interface GamesState {
  items: GameTile[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

const initialState: GamesState = {
  items: [],
  loading: false,
  error: null,
  searchQuery: '',
  pageNumber: 1,
  pageSize: 10, // Initial page size - will be set in component on first load
  totalCount: 0,
};

/**
 * Async thunk to fetch games tiles
 */
export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async (params: GamesTilesParams = {}, { rejectWithValue }) => {
    try {
      const response = await fetchGamesTiles(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch games'
      );
    }
  }
);

/**
 * Async thunk to fetch games for a specific category
 */
export const fetchGamesByCategory = createAsyncThunk(
  'games/fetchGamesByCategory',
  async (
    { getPageUrl, params }: { getPageUrl: string; params?: GamesTilesParams },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchCategoryGames(getPageUrl, params || {});
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch category games'
      );
    }
  }
);

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    /**
     * Set search query
     */
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.pageNumber = 1; // Reset to first page when searching
      state.items = []; // Clear items on new search
      // pageSize will be set in component when fetching
    },
    /**
     * Set page number
     */
    setPageNumber: (state, action: PayloadAction<number>) => {
      state.pageNumber = action.payload;
    },
    /**
     * Set page size
     */
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.pageNumber = 1; // Reset to first page when changing page size
    },
    /**
     * Increase page size by specified amount (for dynamic loading)
     */
    increasePageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = state.pageSize + (action.payload || 20);
    },
    /**
     * Clear games list
     */
    clearGames: (state) => {
      state.items = [];
      state.totalCount = 0;
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
      // Fetch games
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.games || [];
        state.totalCount = action.payload.totalCount || 0;
        state.pageNumber = action.payload.pageNumber || state.pageNumber;
        state.pageSize = action.payload.pageSize || state.pageSize;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch games by category
      .addCase(fetchGamesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGamesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        const newGames = action.payload.games || [];
        
        // If pageSize increased, append new games; otherwise replace
        const requestedPageSize = action.meta.arg.params?.pageSize || state.pageSize;
        const isIncreasingPageSize = requestedPageSize > state.pageSize;
        
        if (isIncreasingPageSize) {
          // Append new games, avoiding duplicates
          const existingIds = new Set(state.items.map((game) => game.id));
          const uniqueNewGames = newGames.filter(
            (game) => !existingIds.has(game.id)
          );
          state.items = [...state.items, ...uniqueNewGames];
        } else {
          // Replace items (new category/search or first load)
          state.items = newGames;
        }
        
        state.totalCount = action.payload.totalCount || 0;
        state.pageNumber = action.payload.pageNumber || state.pageNumber;
        state.pageSize = requestedPageSize; // Use requested pageSize, not from API
      })
      .addCase(fetchGamesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchQuery,
  setPageNumber,
  setPageSize,
  increasePageSize,
  clearGames,
  clearError,
} = gamesSlice.actions;
export default gamesSlice.reducer;

