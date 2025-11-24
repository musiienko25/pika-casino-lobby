/**
 * Games List Component
 * Displays a grid of game tiles with loading and error states
 */

'use client';

import { useEffect, useState, memo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGamesByCategory, setPageNumber } from '@/store/slices/gamesSlice';
import {
  selectGamesWithPagination,
  selectGamesLoading,
  selectGamesError,
  selectSearchQuery,
  selectPageNumber,
  selectCategoriesWithSelection,
} from '@/store/selectors';
import { INITIAL_PAGE_SIZE, INITIAL_LOADER_MIN_TIME } from '@/constants';
import GameTile from './GameTile';
import SkeletonLoader from './SkeletonLoader';
import Pagination from './Pagination';
import styles from './GamesList.module.scss';

function GamesList() {
  const dispatch = useAppDispatch();
  
  // Use memoized selectors
  const { games: items } = useAppSelector(selectGamesWithPagination);
  const pageNumber = useAppSelector(selectPageNumber);
  const loading = useAppSelector(selectGamesLoading);
  const error = useAppSelector(selectGamesError);
  const searchQuery = useAppSelector(selectSearchQuery);
  const { selectedCategory } = useAppSelector(selectCategoriesWithSelection);
  
  // Show loader for at least 1 second to prevent flickering
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoader(false);
    }, INITIAL_LOADER_MIN_TIME);
    
    return () => clearTimeout(timer);
  }, []);

  // Track previous category and search to reset pageNumber when they change
  const prevCategoryIdRef = useRef<string | undefined>(selectedCategory?.id);
  const prevSearchQueryRef = useRef<string | undefined>(searchQuery);
  
  // Reset pageNumber to 1 when category or search changes
  useEffect(() => {
    const categoryChanged = selectedCategory?.id !== prevCategoryIdRef.current;
    const searchChanged = searchQuery !== prevSearchQueryRef.current;
    
    if (categoryChanged || searchChanged) {
      prevCategoryIdRef.current = selectedCategory?.id;
      prevSearchQueryRef.current = searchQuery;
      if (pageNumber !== 1) {
        dispatch(setPageNumber(1));
      }
    }
  }, [selectedCategory?.id, searchQuery, dispatch, pageNumber]);

  // Fetch games when category, search, or pageNumber changes
  // Use getPage from selectedCategory to fetch games for that specific category
  const lastFetchRef = useRef<string>('');
  
  useEffect(() => {
    if (!selectedCategory?.getPage || loading) {
      return;
    }
    
    // Check if endpoint supports search and pagination
    const supportsSearch = selectedCategory.getPage.includes('/en/games/tiles') || 
                           selectedCategory.getPage === '/casino' || 
                           selectedCategory.getPage === '/pages/en/casino';
    
    // Check if endpoint supports pagination
    // /en/games/tiles supports pagination, but /pages/en/casino/* endpoints don't
    const supportsPagination = supportsSearch; // Same endpoints support both
    
    // Use client-side pagination if:
    // 1. Search is active and endpoint doesn't support search, OR
    // 2. Endpoint doesn't support pagination (e.g., /pages/en/casino/most-popular)
    const hasSearch = searchQuery && searchQuery.trim().length > 0;
    const useClientSidePagination = (hasSearch && !supportsSearch) || !supportsPagination;
    
    // Create a unique key for this fetch request
    // For client-side pagination, don't include pageNumber in the key
    const fetchKey = useClientSidePagination
      ? `${selectedCategory.getPage}-${searchQuery || ''}`
      : `${selectedCategory.getPage}-${searchQuery || ''}-${pageNumber}`;
    
    // Only fetch if this is a new request
    if (lastFetchRef.current !== fetchKey) {
      lastFetchRef.current = fetchKey;
      
      // Fetch games for the selected category using its getPage URL
      // API will filter games by category on the server side
      // For client-side pagination, fetch with pageNumber=1 (we'll paginate client-side)
      dispatch(
        fetchGamesByCategory(selectedCategory.getPage, {
          search: searchQuery || undefined,
          pageNumber: useClientSidePagination ? 1 : pageNumber,
          pageSize: INITIAL_PAGE_SIZE,
        })
      );
    }
  }, [dispatch, selectedCategory?.getPage, searchQuery, pageNumber, loading]);

  // Show skeleton loader if loading or during first second
  if ((loading || showInitialLoader) && items.length === 0) {
    return (
      <div className={styles.gamesList}>
        <div className={styles.gamesGrid}>
          <SkeletonLoader count={INITIAL_PAGE_SIZE} />
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className={styles.gamesList}>
        <div className={styles.error}>
          <p>Error loading games: {error}</p>
           <button
             type="button"
             onClick={() => {
               if (selectedCategory?.getPage) {
                 dispatch(
                   fetchGamesByCategory(selectedCategory.getPage, {
                     search: searchQuery || undefined,
                     pageNumber,
                     pageSize: INITIAL_PAGE_SIZE,
                   })
                 );
               }
             }}
           >
             Retry
           </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.gamesList}>
        <div className={styles.empty}>
          <p>No games found</p>
          {searchQuery && (
            <p className={styles.emptyHint}>
              Try adjusting your search query
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gamesList}>
      <div className={styles.gamesGridContainer}>
        <div className={styles.gamesGrid}>
          {items.map((game, index) => (
            <GameTile key={game.id} game={game} index={index} />
          ))}
        </div>
        
        {/* Show loading overlay when filtering by category */}
        {loading && items.length > 0 && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading games...</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      <Pagination />
    </div>
  );
}

export default memo(GamesList);

