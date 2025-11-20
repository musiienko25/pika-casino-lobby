/**
 * Type definitions for the Pika Casino Lobby application
 */

// Category type from config API
export interface Category {
  id: string;
  name: string;
  getPage: string; // URL to fetch games for this category
}

// Config response type
export interface ConfigResponse {
  categories: Category[];
  [key: string]: unknown; // Allow other properties
}

// Game tile type
export interface GameTile {
  id: string;
  name: string;
  thumbnail: string;
  provider?: string;
  [key: string]: unknown; // Allow other properties
}

// Games tiles response type
export interface GamesTilesResponse {
  games: GameTile[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  [key: string]: unknown; // Allow other properties
}

// Query parameters for games tiles API
export interface GamesTilesParams {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
  category?: string;
}

