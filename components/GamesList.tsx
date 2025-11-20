/**
 * Games List Component
 * Displays a grid of game tiles with loading and error states
 */

'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGamesByCategory } from '@/store/slices/gamesSlice';
import styles from './GamesList.module.scss';

export default function GamesList() {
  const dispatch = useAppDispatch();
  const { items, loading, error, searchQuery, pageNumber, pageSize } =
    useAppSelector((state) => state.games);
  const selectedCategory = useAppSelector(
    (state) => state.categories.selectedCategory
  );

  useEffect(() => {
    // Fetch games when category or search changes
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
  }, [dispatch, selectedCategory, searchQuery, pageNumber, pageSize]);

  if (loading && items.length === 0) {
    return (
      <div className={styles.gamesList}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading games...</p>
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
        {items.map((game) => (
          <div key={game.id} className={styles.gameTile}>
            <div className={styles.gameThumbnail}>
              {game.thumbnail && 
               typeof game.thumbnail === 'string' && 
               (game.thumbnail.startsWith('http') || game.thumbnail.startsWith('/')) ? (
                <Image
                  src={game.thumbnail}
                  alt={game.name || 'Game thumbnail'}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className={styles.thumbnailImage}
                  loading="lazy"
                  onError={(e) => {
                    // Hide image on error and show placeholder
                    const target = e.target as HTMLImageElement;
                    if (target.parentElement) {
                      target.style.display = 'none';
                    }
                  }}
                />
              ) : (
                <div className={styles.thumbnailPlaceholder}>
                  {game.name?.[0] || '?'}
                </div>
              )}
            </div>
            <div className={styles.gameInfo}>
              <h3 className={styles.gameName}>{game.name || 'Unknown Game'}</h3>
              {game.provider && (
                <p className={styles.gameProvider}>{game.provider}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {loading && items.length > 0 && (
        <div className={styles.loadingMore}>
          <div className={styles.spinner}></div>
          <p>Loading more games...</p>
        </div>
      )}
    </div>
  );
}

