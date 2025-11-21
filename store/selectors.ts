/**
 * Redux Selectors
 * Memoized selectors for better performance
 */

import { createSelector } from 'reselect';
import type { RootState } from './store';
import type { GameTile } from '@/types';

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

// Helper function to get category name from game
function getGameCategoryName(game: GameTile): string | null {
  if (!game.category) return null;
  
  if (typeof game.category === 'string') {
    return game.category;
  }
  
  if (typeof game.category === 'object' && game.category !== null) {
    return game.category.name || null;
  }
  
  return null;
}

// Memoized selector for filtered games by category and search
export const selectFilteredGames = createSelector(
  [selectGames, selectSelectedCategory, selectSearchQuery],
  (games, selectedCategory, searchQuery) => {
    let filtered = games;

    // Filter by category name if selected
    if (selectedCategory) {
      const selectedCategoryName = selectedCategory.name;
      filtered = filtered.filter((game) => {
        const gameCategoryName = getGameCategoryName(game);
        
        // If game doesn't have category.name, include it (API already filtered by category URL)
        if (!gameCategoryName) return true;
        
        // Compare category names (case-insensitive)
        return gameCategoryName.toLowerCase() === selectedCategoryName.toLowerCase();
      });
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((game) => {
        const name = (game.name || '').toLowerCase();
        const provider = (game.provider || '').toLowerCase();
        return name.includes(query) || provider.includes(query);
      });
    }

    return filtered;
  }
);

// Memoized selector for games with pagination info
// API already handles pagination, so we just return what we have
export const selectGamesWithPagination = createSelector(
  [selectGames, selectTotalCount, selectPageSize, selectPageNumber],
  (games, totalCount, pageSize, pageNumber) => {
    return {
      games, // API already returns paginated games
      totalCount, // Use totalCount from API
      pageSize,
      pageNumber,
      hasMore: games.length < totalCount && totalCount > 0,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    };
  }
);

