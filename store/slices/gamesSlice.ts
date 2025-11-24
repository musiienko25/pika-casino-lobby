/**
 * Redux slice for managing games state
 * Using plain Redux
 */

import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { fetchGamesTiles, fetchCategoryGames } from '@/services/api';
import type { GameTile, GamesTilesParams } from '@/types';

// Import RootState from store
import type { RootState } from '../store';

// Action Types
export const GAMES_ACTION_TYPES = {
  // Sync actions
  SET_SEARCH_QUERY: 'games/SET_SEARCH_QUERY',
  SET_PAGE_NUMBER: 'games/SET_PAGE_NUMBER',
  SET_PAGE_SIZE: 'games/SET_PAGE_SIZE',
  INCREASE_PAGE_SIZE: 'games/INCREASE_PAGE_SIZE',
  CLEAR_GAMES: 'games/CLEAR_GAMES',
  CLEAR_ERROR: 'games/CLEAR_ERROR',
  // Async actions
  FETCH_GAMES_PENDING: 'games/FETCH_GAMES_PENDING',
  FETCH_GAMES_FULFILLED: 'games/FETCH_GAMES_FULFILLED',
  FETCH_GAMES_REJECTED: 'games/FETCH_GAMES_REJECTED',
  FETCH_GAMES_BY_CATEGORY_PENDING: 'games/FETCH_GAMES_BY_CATEGORY_PENDING',
  FETCH_GAMES_BY_CATEGORY_FULFILLED: 'games/FETCH_GAMES_BY_CATEGORY_FULFILLED',
  FETCH_GAMES_BY_CATEGORY_REJECTED: 'games/FETCH_GAMES_BY_CATEGORY_REJECTED',
} as const;

// State interface
export interface GamesState {
  items: GameTile[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

// Action interfaces
interface SetSearchQueryAction {
  type: typeof GAMES_ACTION_TYPES.SET_SEARCH_QUERY;
  payload: string;
}

interface SetPageNumberAction {
  type: typeof GAMES_ACTION_TYPES.SET_PAGE_NUMBER;
  payload: number;
}

interface SetPageSizeAction {
  type: typeof GAMES_ACTION_TYPES.SET_PAGE_SIZE;
  payload: number;
}

interface IncreasePageSizeAction {
  type: typeof GAMES_ACTION_TYPES.INCREASE_PAGE_SIZE;
  payload: number;
}

interface ClearGamesAction {
  type: typeof GAMES_ACTION_TYPES.CLEAR_GAMES;
}

interface ClearErrorAction {
  type: typeof GAMES_ACTION_TYPES.CLEAR_ERROR;
}

interface FetchGamesPendingAction {
  type: typeof GAMES_ACTION_TYPES.FETCH_GAMES_PENDING;
}

interface FetchGamesFulfilledAction {
  type: typeof GAMES_ACTION_TYPES.FETCH_GAMES_FULFILLED;
  payload: {
    games: GameTile[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  };
}

interface FetchGamesRejectedAction {
  type: typeof GAMES_ACTION_TYPES.FETCH_GAMES_REJECTED;
  payload: string;
}

interface FetchGamesByCategoryPendingAction {
  type: typeof GAMES_ACTION_TYPES.FETCH_GAMES_BY_CATEGORY_PENDING;
}

interface FetchGamesByCategoryFulfilledAction {
  type: typeof GAMES_ACTION_TYPES.FETCH_GAMES_BY_CATEGORY_FULFILLED;
  payload: {
    games: GameTile[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    requestedPageSize: number;
  };
}

interface FetchGamesByCategoryRejectedAction {
  type: typeof GAMES_ACTION_TYPES.FETCH_GAMES_BY_CATEGORY_REJECTED;
  payload: string;
}

export type GamesAction =
  | SetSearchQueryAction
  | SetPageNumberAction
  | SetPageSizeAction
  | IncreasePageSizeAction
  | ClearGamesAction
  | ClearErrorAction
  | FetchGamesPendingAction
  | FetchGamesFulfilledAction
  | FetchGamesRejectedAction
  | FetchGamesByCategoryPendingAction
  | FetchGamesByCategoryFulfilledAction
  | FetchGamesByCategoryRejectedAction
  | { type: string; [key: string]: unknown }; // Index signature for compatibility

// Initial state
const initialState: GamesState = {
  items: [],
  loading: false,
  error: null,
  searchQuery: '',
  pageNumber: 1,
  pageSize: 10, // Initial page size - will be set in component on first load
  totalCount: 0,
};

// Action Creators (Sync)
export const setSearchQuery = (query: string): SetSearchQueryAction => ({
  type: GAMES_ACTION_TYPES.SET_SEARCH_QUERY,
  payload: query,
});

export const setPageNumber = (pageNumber: number): SetPageNumberAction => ({
  type: GAMES_ACTION_TYPES.SET_PAGE_NUMBER,
  payload: pageNumber,
});

export const setPageSize = (pageSize: number): SetPageSizeAction => ({
  type: GAMES_ACTION_TYPES.SET_PAGE_SIZE,
  payload: pageSize,
});

export const increasePageSize = (increment: number): IncreasePageSizeAction => ({
  type: GAMES_ACTION_TYPES.INCREASE_PAGE_SIZE,
  payload: increment,
});

export const clearGames = (): ClearGamesAction => ({
  type: GAMES_ACTION_TYPES.CLEAR_GAMES,
});

export const clearError = (): ClearErrorAction => ({
  type: GAMES_ACTION_TYPES.CLEAR_ERROR,
});

// Action Creators (Async) - using redux-thunk
type GamesThunkAction = ThunkAction<
  Promise<void>,
  RootState,
  unknown,
  GamesAction
>;

export const fetchGames = (
  params: GamesTilesParams = {}
): GamesThunkAction => {
  return async (dispatch: ThunkDispatch<RootState, unknown, GamesAction>) => {
    dispatch({ type: GAMES_ACTION_TYPES.FETCH_GAMES_PENDING } as GamesAction);
    try {
      const response = await fetchGamesTiles(params);
      dispatch({
        type: GAMES_ACTION_TYPES.FETCH_GAMES_FULFILLED,
        payload: {
          games: [...(response.games || [])], // Convert readonly to mutable
          totalCount: response.totalCount || 0,
          pageNumber: response.pageNumber || 1,
          pageSize: response.pageSize || 10,
        },
      } as FetchGamesFulfilledAction);
    } catch (error) {
      dispatch({
        type: GAMES_ACTION_TYPES.FETCH_GAMES_REJECTED,
        payload: error instanceof Error ? error.message : 'Failed to fetch games',
      } as FetchGamesRejectedAction);
    }
  };
};

// Fetch games for a specific category using the getPage URL
// Server-side filtering: API filters games by category via getPage endpoint
// Client-side filtering: When search is active, fetch more games to filter client-side
export const fetchGamesByCategory = (
  getPageUrl: string,
  params?: GamesTilesParams
): GamesThunkAction => {
  return async (dispatch: ThunkDispatch<RootState, unknown, GamesAction>, getState) => {
    dispatch({ type: GAMES_ACTION_TYPES.FETCH_GAMES_BY_CATEGORY_PENDING } as GamesAction);
    try {
      const state = getState();
      const currentState = state.games;
      
      const searchQuery = params?.search || currentState.searchQuery || '';
      const hasSearch = searchQuery.trim().length > 0;
      
      // Check if this endpoint supports search parameter
      // Only /en/games/tiles endpoint supports search, other endpoints (/pages/en/casino/*) don't
      const supportsSearch = getPageUrl.includes('/en/games/tiles') || 
                             getPageUrl === '/casino' || 
                             getPageUrl === '/pages/en/casino';
      
      const basePageSize = params?.pageSize || currentState.pageSize || 10;
      
      // When search is active:
      // - If endpoint supports search: use normal page size and pass search to API
      // - If endpoint doesn't support search: fetch more games (200) to filter client-side
      //   This ensures we have enough games to search through
      const fetchPageSize = (hasSearch && !supportsSearch) 
        ? 200 
        : basePageSize;
      
      // Fetch games for the category with pagination
      const fetchParams = {
        pageNumber: params?.pageNumber || currentState.pageNumber || 1,
        pageSize: fetchPageSize,
        // Only pass search to API if endpoint supports it
        // For other categories, we'll filter client-side using the selector
        search: (hasSearch && supportsSearch) ? searchQuery : undefined,
      };
      
      // Fetch games using getPage URL - API will filter by category on server
      const response = await fetchCategoryGames(getPageUrl, fetchParams);
      
      dispatch({
        type: GAMES_ACTION_TYPES.FETCH_GAMES_BY_CATEGORY_FULFILLED,
        payload: {
          games: [...response.games], // Convert readonly to mutable
          totalCount: response.totalCount || 0,
          pageNumber: response.pageNumber || fetchParams.pageNumber,
          pageSize: response.pageSize || fetchParams.pageSize,
          requestedPageSize: basePageSize, // Store the actual requested page size for pagination
        },
      } as FetchGamesByCategoryFulfilledAction);
    } catch (error) {
      dispatch({
        type: GAMES_ACTION_TYPES.FETCH_GAMES_BY_CATEGORY_REJECTED,
        payload: error instanceof Error ? error.message : 'Failed to fetch category games',
      } as FetchGamesByCategoryRejectedAction);
    }
  };
};

// Reducer
export default function gamesReducer(
  state: GamesState = initialState,
  action: GamesAction
): GamesState {
  switch (action.type) {
    case GAMES_ACTION_TYPES.SET_SEARCH_QUERY: {
      const typedAction = action as SetSearchQueryAction;
      return {
        ...state,
        searchQuery: typedAction.payload,
        pageNumber: 1,
        items: [],
      };
    }
    
    case GAMES_ACTION_TYPES.SET_PAGE_NUMBER: {
      const typedAction = action as SetPageNumberAction;
      return {
        ...state,
        pageNumber: typedAction.payload,
      };
    }
    
    case GAMES_ACTION_TYPES.SET_PAGE_SIZE: {
      const typedAction = action as SetPageSizeAction;
      return {
        ...state,
        pageSize: typedAction.payload,
        pageNumber: 1,
      };
    }
    
    case GAMES_ACTION_TYPES.INCREASE_PAGE_SIZE: {
      const typedAction = action as IncreasePageSizeAction;
      return {
        ...state,
        pageSize: state.pageSize + (typedAction.payload || 20),
      };
    }
    
    case GAMES_ACTION_TYPES.CLEAR_GAMES:
      return {
        ...state,
        items: [],
        totalCount: 0,
      };
    
    case GAMES_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case GAMES_ACTION_TYPES.FETCH_GAMES_PENDING:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case GAMES_ACTION_TYPES.FETCH_GAMES_FULFILLED: {
      const typedAction = action as FetchGamesFulfilledAction;
      return {
        ...state,
        loading: false,
        items: [...(typedAction.payload.games || [])],
        totalCount: typedAction.payload.totalCount || 0,
        pageNumber: typedAction.payload.pageNumber || state.pageNumber,
        pageSize: typedAction.payload.pageSize || state.pageSize,
      };
    }
    
    case GAMES_ACTION_TYPES.FETCH_GAMES_REJECTED: {
      const typedAction = action as FetchGamesRejectedAction;
      return {
        ...state,
        loading: false,
        error: typedAction.payload,
      };
    }
    
    case GAMES_ACTION_TYPES.FETCH_GAMES_BY_CATEGORY_PENDING:
      // For client-side filtering: don't clear games if they're already loaded
      // Only clear on initial load (when items are empty)
      return {
        ...state,
        loading: true,
        error: null,
        // Keep existing games during fetch for smoother UX
        // Games will be replaced when FETCH_GAMES_BY_CATEGORY_FULFILLED is dispatched
      };
    
    case GAMES_ACTION_TYPES.FETCH_GAMES_BY_CATEGORY_FULFILLED: {
      const typedAction = action as FetchGamesByCategoryFulfilledAction;
      const newGames = typedAction.payload.games || [];

      // For client-side filtering: replace all games with new fetch
      // This allows us to filter by category.name on the client
      return {
        ...state,
        loading: false,
        items: [...newGames], // Store all games for client-side filtering
        totalCount: typedAction.payload.totalCount || newGames.length,
        pageNumber: 1, // Reset to page 1 after new fetch
        pageSize: typedAction.payload.requestedPageSize || state.pageSize,
      };
    }
    
    case GAMES_ACTION_TYPES.FETCH_GAMES_BY_CATEGORY_REJECTED: {
      const typedAction = action as FetchGamesByCategoryRejectedAction;
      return {
        ...state,
        loading: false,
        error: typedAction.payload,
      };
    }
    
    default:
      return state;
  }
}
