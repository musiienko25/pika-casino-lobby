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
export const selectGamesWithPagination = createSelector(
  [selectGames, selectTotalCount, selectPageSize, selectPageNumber],
  (games, totalCount, pageSize, pageNumber) => ({
    games,
    totalCount,
    pageSize,
    pageNumber,
    hasMore: games.length < totalCount,
    totalPages: Math.ceil(totalCount / pageSize) || 1,
  })
);

