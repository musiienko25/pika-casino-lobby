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
// Client-side filtering: Filter by search query when API doesn't support it for certain categories
// Server-side pagination: API returns paginated games based on pageNumber/pageSize
// Client-side pagination: Only when search is active and we have many games (likely client-side fetch)
export const selectGamesWithPagination = createSelector(
  [selectGames, selectTotalCount, selectPageSize, selectPageNumber, selectSearchQuery],
  (games, totalCount, pageSize, pageNumber, searchQuery) => {
    const hasSearch = searchQuery && searchQuery.trim().length > 0;
    
    // Filter games by search query if provided (client-side filtering)
    // This ensures search works for all categories, even if the API doesn't support search parameter
    let filteredGames = games;
    if (hasSearch) {
      const query = searchQuery.trim().toLowerCase();
      filteredGames = games.filter((game) => {
        const gameName = (game.name || '').toLowerCase();
        return gameName.includes(query);
      });
    }
    
    // Calculate total count for filtered results
    const filteredTotalCount = hasSearch 
      ? filteredGames.length 
      : totalCount;
    
    // Determine if we should use client-side pagination:
    // - If we have many games (> pageSize): use client-side pagination
    //   This happens when:
    //   1. Endpoint doesn't support pagination (e.g., /pages/en/casino/most-popular) - returns all games
    //   2. Search is active and endpoint doesn't support search - we fetch 200 games
    // - If we have few games (<= pageSize): API already paginated, use as-is
    //   This happens when endpoint supports pagination and returned one page
    const shouldUseClientPagination = filteredGames.length > pageSize;
    
    let paginatedGames = filteredGames;
    if (shouldUseClientPagination) {
      // Apply client-side pagination to filtered games
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      paginatedGames = filteredGames.slice(startIndex, endIndex);
    }
    // If few games: API already returned the correct page, use as-is
    
    return {
      games: paginatedGames,
      totalCount: filteredTotalCount,
      pageSize,
      pageNumber,
      hasMore: shouldUseClientPagination 
        ? (pageNumber * pageSize) < filteredTotalCount
        : (pageNumber * pageSize) < totalCount,
      totalPages: Math.ceil(filteredTotalCount / pageSize) || 1,
    };
  }
);

