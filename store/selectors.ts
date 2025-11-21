/**
 * Redux Selectors
 * Memoized selectors for better performance
 */

import { createSelector } from 'reselect';
import type { RootState } from './store';

// Categories selectors
export const selectCategories = (state: RootState) => state.categories.items;
export const selectSelectedCategory = (state: RootState) => state.categories.selectedCategory;
export const selectCategoriesLoading = (state: RootState) => state.categories.loading;
export const selectCategoriesError = (state: RootState) => state.categories.error;

// Memoized selector for categories with selected category info
export const selectCategoriesWithSelection = createSelector(
  [selectCategories, selectSelectedCategory],
  (categories, selectedCategory) => ({
    categories,
    selectedCategory,
    hasCategories: categories.length > 0,
  })
);

// Games selectors
export const selectGames = (state: RootState) => state.games.items;
export const selectGamesLoading = (state: RootState) => state.games.loading;
export const selectGamesError = (state: RootState) => state.games.error;
export const selectSearchQuery = (state: RootState) => state.games.searchQuery;
export const selectPageNumber = (state: RootState) => state.games.pageNumber;
export const selectPageSize = (state: RootState) => state.games.pageSize;
export const selectTotalCount = (state: RootState) => state.games.totalCount;

// Memoized selector for games with pagination info
// Server-side filtering: API filters by category via getPage URL
// Server-side pagination: API returns paginated games based on pageNumber/pageSize
// No client-side filtering needed - just return what server gives us
export const selectGamesWithPagination = createSelector(
  [selectGames, selectTotalCount, selectPageSize, selectPageNumber],
  (games, totalCount, pageSize, pageNumber) => {
    // Server already filtered by category and paginated
    // Just return the games as-is
    return {
      games, // Already filtered and paginated by server
      totalCount, // Use totalCount from API
      pageSize,
      pageNumber,
      hasMore: games.length < totalCount && totalCount > 0,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  }
);

