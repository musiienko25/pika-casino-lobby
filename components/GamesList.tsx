/**
 * Games List Component
 * Displays a grid of game tiles with loading and error states
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGamesByCategory, increasePageSize } from '@/store/slices/gamesSlice';
import { INITIAL_PAGE_SIZE, LOAD_MORE_INCREMENT, INITIAL_LOADER_MIN_TIME } from '@/constants';
import GameTile from './GameTile';
import SkeletonLoader from './SkeletonLoader';
import styles from './GamesList.module.scss';

export default function GamesList() {
  const dispatch = useAppDispatch();
  const { items, loading, error, searchQuery, pageNumber, pageSize, totalCount } =
    useAppSelector((state) => state.games);
  const selectedCategory = useAppSelector(
    (state) => state.categories.selectedCategory
  );
  
  // Show loader for at least 1 second to prevent flickering
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoader(false);
    }, INITIAL_LOADER_MIN_TIME);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle Load More - increase pageSize by LOAD_MORE_INCREMENT
  const handleLoadMore = useCallback(() => {
    if (!loading && selectedCategory?.getPage) {
      const newPageSize = pageSize + LOAD_MORE_INCREMENT;
      dispatch(increasePageSize(LOAD_MORE_INCREMENT));
      dispatch(
        fetchGamesByCategory({
          getPageUrl: selectedCategory.getPage,
          params: {
            search: searchQuery || undefined,
            pageNumber: 1, // Always page 1 when increasing pageSize
            pageSize: newPageSize,
          },
        })
      );
    }
  }, [loading, selectedCategory, pageSize, searchQuery, dispatch]);

  // Fetch games only when category or search changes (initial load)
  useEffect(() => {
    if (selectedCategory?.getPage) {
      // Fetch initial games with pageSize 10
      // pageSize will be updated in Redux slice from the request params
      dispatch(
        fetchGamesByCategory({
          getPageUrl: selectedCategory.getPage,
          params: {
            search: searchQuery || undefined,
            pageNumber: 1,
            pageSize: INITIAL_PAGE_SIZE,
          },
        })
      );
    }
  }, [dispatch, selectedCategory, searchQuery]); // Only trigger on category/search change

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
                  fetchGamesByCategory({
                    getPageUrl: selectedCategory.getPage,
                    params: {
                      search: searchQuery || undefined,
                      pageNumber,
                      pageSize,
                    },
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
      <div className={styles.gamesGrid}>
        {items.map((game, index) => (
          <GameTile key={game.id} game={game} index={index} />
        ))}
      </div>
      
      {/* Load More Button */}
            {!loading && items.length < totalCount && totalCount > 0 && (
              <div className={styles.loadMoreContainer}>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className={styles.loadMoreButton}
                  disabled={loading}
                  aria-label={`Load ${LOAD_MORE_INCREMENT} more games`}
                >
                  Load More Games (+{LOAD_MORE_INCREMENT})
                </button>
          <p className={styles.loadMoreInfo}>
            Showing {items.length} of {totalCount} games
          </p>
        </div>
      )}
      
            {loading && items.length > 0 && (
              <div className={styles.skeletonContainer}>
                <div className={styles.gamesGrid}>
                  <SkeletonLoader count={LOAD_MORE_INCREMENT} />
                </div>
              </div>
            )}
      
      {!loading && items.length >= totalCount && items.length > 0 && totalCount > 0 && (
        <div className={styles.endOfList}>
          <p>All games loaded ({items.length} of {totalCount})</p>
        </div>
      )}
    </div>
  );
}

