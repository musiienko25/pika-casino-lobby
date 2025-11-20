/**
 * Type definitions for the Pika Casino Lobby application
 */

// Category type from config API
export interface Category {
  readonly id: string;
  readonly name: string;
  readonly getPage: string; // URL to fetch games for this category
}

// Menu item type from config API
export interface MenuItem {
  readonly id?: string;
  readonly slug?: string;
  readonly title?: string;
  readonly name?: string;
  readonly label?: string;
  readonly getPage?: string;
  readonly url?: string;
  readonly path?: string;
}

// Config response type
export interface ConfigResponse {
  readonly categories?: readonly Category[];
  readonly menu?: {
    readonly lobby?: {
      readonly items?: readonly MenuItem[];
    };
    readonly liveLobby?: {
      readonly items?: readonly unknown[];
    };
  };
}

// Game tile type - strict definition
export interface GameTile {
  readonly id: string;
  readonly name: string;
  readonly thumbnail: string;
  readonly provider?: string;
  readonly platformId?: string;
  readonly slug?: string;
  readonly gameText?: string;
  readonly title?: string;
  readonly provider_slug?: string;
  readonly providerLogo?: {
    readonly alt?: string;
    readonly original?: {
      readonly src?: string;
      readonly url?: string;
      readonly metadata?: {
        readonly size?: number;
        readonly width?: number;
        readonly height?: number;
      };
    };
  };
  readonly betSize?: {
    readonly min?: number;
    readonly max?: number;
  };
  readonly isLiveGame?: boolean;
}

// Games tiles response type - strict definition
export interface GamesTilesResponse {
  readonly games: readonly GameTile[];
  readonly totalCount: number;
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly count?: number;
  readonly total?: number;
}

// Query parameters for games tiles API
export interface GamesTilesParams {
  readonly search?: string;
  readonly pageNumber?: number;
  readonly pageSize?: number;
  readonly category?: string;
}

// Type guard for Category
export function isCategory(value: unknown): value is Category {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'getPage' in value &&
    typeof (value as Category).id === 'string' &&
    typeof (value as Category).name === 'string' &&
    typeof (value as Category).getPage === 'string'
  );
}

// Type guard for GameTile
export function isGameTile(value: unknown): value is GameTile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'thumbnail' in value &&
    typeof (value as GameTile).id === 'string' &&
    typeof (value as GameTile).name === 'string' &&
    typeof (value as GameTile).thumbnail === 'string'
  );
}

