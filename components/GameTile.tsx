/**
 * Game Tile Component
 * Memoized component for individual game tile
 */

'use client';

import { memo } from 'react';
import Image from 'next/image';
import type { GameTile as GameTileType } from '@/types';
import styles from './GamesList.module.scss';

interface GameTileProps {
  game: GameTileType;
}

function GameTile({ game }: GameTileProps) {
  const hasValidThumbnail = 
    game.thumbnail &&
    typeof game.thumbnail === 'string' &&
    (game.thumbnail.startsWith('http') || game.thumbnail.startsWith('/'));

  return (
    <div className={styles.gameTile} role="article" aria-label={`Game: ${game.name}`}>
      <div className={styles.gameThumbnail}>
        {hasValidThumbnail ? (
          <Image
            src={game.thumbnail}
            alt={game.name || 'Game thumbnail'}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={styles.thumbnailImage}
            loading="lazy"
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

