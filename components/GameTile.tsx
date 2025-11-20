/**
 * Game Tile Component
 * Memoized component for individual game tile
 */

'use client';

import { memo, useCallback } from 'react';
import Image from 'next/image';
import type { GameTile as GameTileType } from '@/types';
import { GAME_THUMBNAIL_BLUR } from '@/utils/blur';
import { analytics } from '@/utils/analytics';
import styles from './GamesList.module.scss';

interface GameTileProps {
  game: GameTileType;
  index?: number;
}

function GameTile({ game, index = 0 }: GameTileProps) {
  const hasValidThumbnail = 
    game.thumbnail &&
    typeof game.thumbnail === 'string' &&
    (game.thumbnail.startsWith('http') || game.thumbnail.startsWith('/'));

  // Load first 4 images with priority (above the fold), next 4 eagerly, rest lazily
  const shouldLoadEagerly = index < 8;
  const shouldHavePriority = index < 4;

  const handleClick = useCallback(() => {
    // Track game click
    if (analytics) {
      analytics.trackGameClick(game.id, game.name);
    }
    // In a real application, you would navigate to the game page here
    // router.push(`/games/${game.id}`);
  }, [game.id, game.name]);

  return (
    <div 
      className={styles.gameTile} 
      role="article" 
      aria-label={`Game: ${game.name}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={styles.gameThumbnail}>
        {hasValidThumbnail ? (
          <Image
            src={game.thumbnail}
            alt={game.name || 'Game thumbnail'}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={styles.thumbnailImage}
            loading={shouldLoadEagerly ? 'eager' : 'lazy'}
            priority={shouldHavePriority}
            placeholder="blur"
            blurDataURL={GAME_THUMBNAIL_BLUR}
            onError={(e) => {
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
  );
}

export default memo(GameTile);

