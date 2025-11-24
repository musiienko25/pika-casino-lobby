/**
 * API service for fetching data from Pika Casino API
 */

import type {
  Category,
  ConfigResponse,
  GameTile,
  GamesTilesParams,
  GamesTilesResponse,
} from '@/types';
import { API_TIMEOUT } from '@/constants';
import { retryWithBackoff } from '@/utils/retry';
import { logger } from '@/utils/logger';

// API_BASE_URL is defined in app/api/games/route.ts and app/api/config/route.ts

/**
 * Fetches the configuration including menu lobby categories
 * @returns Promise with categories array
 */
export async function fetchConfig(): Promise<Category[]> {
  return retryWithBackoff(async () => {
    // On server, use absolute URL for API route or call API directly with longer timeout
    // On client, use relative URL for API route
    const isServer = typeof window === 'undefined';
    let apiUrl: string;
    
    if (isServer) {
      // On server, call API directly with longer timeout
      // Using API route on server requires absolute URL which is complex
      apiUrl = 'https://casino.api.pikakasino.com/v1/pika/en/config';
    } else {
      // On client, use API route to avoid CORS
      apiUrl = '/api/config';
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      // Increase timeout for server-side requests
      ...(isServer && { signal: AbortSignal.timeout(API_TIMEOUT) }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }

    const data: ConfigResponse = await response.json();
    
    // Extract categories from the response
    // The API returns categories in menu.lobby.items structure
    if (data.menu?.lobby?.items && Array.isArray(data.menu.lobby.items)) {
      // Map the menu items to Category format
      return data.menu.lobby.items
        .map((item) => {
          const menuItem = item as {
            id?: string;
            slug?: string;
            title?: string;
            name?: string;
            label?: string;
            getPage?: string;
            url?: string;
            path?: string;
            links?: {
              getPage?: string;
              getPageMetadata?: string;
            };
          };
          
          // Extract getPage from links.getPage or use path
          // links.getPage contains full URL like "https://casino.api.pikakasino.com/v1/pika/pages/en/casino"
          // For "Lobby" category (path="/casino"), use /en/games/tiles instead
          // For other categories, use /pages/en/casino/new-games structure
          let getPage = menuItem.getPage || menuItem.url || menuItem.path || '';
          
          if (!getPage && menuItem.links?.getPage) {
            // Extract path from full URL
            try {
              const urlObj = new URL(menuItem.links.getPage);
              const fullPath = urlObj.pathname; // e.g., "/pages/en/casino"
              
              // Special case: if path is "/pages/en/casino" (Lobby), use /en/games/tiles
              if (fullPath === '/pages/en/casino' || menuItem.path === '/casino') {
                getPage = '/en/games/tiles';
              } else if (fullPath.startsWith('/pages/en')) {
                // For other categories, keep /pages/en/casino/new-games structure
                getPage = fullPath;
              } else {
                getPage = fullPath;
              }
            } catch {
              // If URL parsing fails, use path if available
              getPage = menuItem.path || '';
            }
          }
          
          // If still no getPage and we have path="/casino", use /en/games/tiles
          if (!getPage && menuItem.path === '/casino') {
            getPage = '/en/games/tiles';
          }
          
          return {
            id: menuItem.id || menuItem.slug || String(Math.random()),
            name: menuItem.title || menuItem.name || menuItem.label || 'Unnamed Category',
            getPage: getPage || menuItem.path || '',
          };
        })
        .filter((cat: Category) => cat.getPage); // Filter out items without getPage
    }
    
    // Fallback: try direct categories array
    if (Array.isArray(data.categories)) {
      return data.categories;
    }
    
    // If categories is not directly available, try to find it in the response
    const categories = (data as unknown as { categories?: Category[] }).categories;
    if (categories) {
      return categories;
    }

    logger.warn('Unexpected config response structure', { data });
    return [];
  }, {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
  });
}

/**
 * Fetches games tiles with optional search and pagination
 * @param params - Query parameters for filtering and pagination
 * @returns Promise with games array
 */
export async function fetchGamesTiles(
  params: GamesTilesParams = {}
): Promise<GamesTilesResponse> {
  return retryWithBackoff(async () => {
    // Use Next.js API route to avoid CORS issues
    const searchParams = new URLSearchParams();
    
    if (params.search) {
      searchParams.append('search', params.search);
    }
    
    if (params.pageNumber !== undefined) {
      searchParams.append('pageNumber', params.pageNumber.toString());
    }
    
    if (params.pageSize !== undefined) {
      searchParams.append('pageSize', params.pageSize.toString());
    }

    if (params.category) {
      searchParams.append('category', params.category);
    }

    const queryString = searchParams.toString();
    const apiUrl = `/api/games${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.statusText}`);
    }

    const data: GamesTilesResponse = await response.json();
    return data;
  }, {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
  });
}

/**
 * Fetches games for a specific category using the getPage URL
 * @param getPageUrl - The URL from category.getPage property
 * @param params - Additional query parameters
 * @returns Promise with games array
 */
export async function fetchCategoryGames(
  getPageUrl: string,
  params: Omit<GamesTilesParams, 'category'> = {}
): Promise<GamesTilesResponse> {
  return retryWithBackoff(async () => {
    // Use Next.js API route to avoid CORS issues
    // The API route will handle the actual fetch to the external API
    const searchParams = new URLSearchParams();
    
    // Extract category path from getPageUrl
    // getPageUrl might be like "/casino", "/pages/en/casino", "/en/games/tiles", or full URL
    let categoryPath = getPageUrl;
    if (getPageUrl.startsWith('http://') || getPageUrl.startsWith('https://')) {
      // Extract path from full URL (e.g., "https://.../pages/en/casino" -> "/pages/en/casino")
      const urlObj = new URL(getPageUrl);
      categoryPath = urlObj.pathname;
    } else if (!getPageUrl.startsWith('/')) {
      categoryPath = `/${getPageUrl}`;
    }
    
    // Special handling for different endpoint types:
    // - "/en/games/tiles" - use as-is (for Lobby/all games)
    // - "/pages/en/casino/new-games" - use as-is (for specific categories)
    // - "/casino" - convert to "/pages/en/casino" (but this doesn't work, so use /en/games/tiles)
    if (categoryPath === '/casino' || categoryPath === '/pages/en/casino') {
      // Lobby category - use /en/games/tiles endpoint
      categoryPath = '/en/games/tiles';
    } else if (!categoryPath.startsWith('/pages/en') && !categoryPath.startsWith('/en/games/tiles')) {
      // Other categories - convert to /pages/en/casino/new-games structure
      categoryPath = `/pages/en${categoryPath}`;
    }
    
    // Use our Next.js API route as proxy
    searchParams.append('category', categoryPath);
    
    if (params.search) {
      searchParams.append('search', params.search);
    }
    
    // Check if endpoint supports pagination
    // /en/games/tiles supports pagination, but /pages/en/casino/* endpoints don't
    const supportsPagination = categoryPath.includes('/en/games/tiles') || 
                               categoryPath === '/casino' || 
                               categoryPath === '/pages/en/casino';
    
    // Only add pagination parameters if endpoint supports them
    if (supportsPagination) {
      if (params.pageNumber !== undefined) {
        searchParams.append('pageNumber', params.pageNumber.toString());
      }
      
      if (params.pageSize !== undefined) {
        searchParams.append('pageSize', params.pageSize.toString());
      }
    }
    // For /pages/en/casino/* endpoints, don't pass pagination - they return all games

    const queryString = searchParams.toString();
    const apiUrl = `/api/games?${queryString}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      logger.error(
        'API Error Response',
        new Error(`Failed to fetch category games: ${response.status} ${response.statusText}`),
        {
          status: response.status,
          statusText: response.statusText,
          url: apiUrl,
          body: errorText,
        }
      );
      throw new Error(`Failed to fetch category games: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle different response structures
    let games: unknown[] = [];
    let extractedTotalCount: number | undefined;
    
    if (Array.isArray(data)) {
      // If response is directly an array
      games = data;
    } else if (Array.isArray(data.games)) {
      games = data.games;
    } else if (Array.isArray(data.items)) {
      games = data.items;
    } else if (Array.isArray(data.data)) {
      games = data.data;
    } else if (data.components && Array.isArray(data.components)) {
      // Handle /pages/en/casino/new-games structure
      // Find component with type "game-list" that has games array
      const gameListComponent = data.components.find(
        (comp: unknown) => {
          const c = comp as Record<string, unknown>;
          return (c.type === 'game-list' || c.type === 'games-tiles') && Array.isArray(c.games);
        }
      );
      
      if (gameListComponent) {
        const component = gameListComponent as Record<string, unknown>;
        games = (component.games as unknown[]) || [];
        
        // component.total might be limited or incorrect
        // Extract collection name from listParameters and fetch real total from /en/games/tiles
        const listParams = component.listParameters as Record<string, unknown> | string[] | undefined;
        let collections: string[] | undefined;
        
        // listParameters can be an array (e.g., ["new-games"]) or an object with collections field
        if (Array.isArray(listParams)) {
          collections = listParams;
        } else if (listParams && typeof listParams === 'object') {
          // listParameters.collections is an array like ["all-games"] or ["new-games"]
          collections = (listParams as Record<string, unknown>).collections as string[] | undefined;
        }
        
        if (collections && collections.length > 0) {
          // Fetch real total from /en/games/tiles with gameCollections parameter
          try {
            const collectionName = collections[0]; // e.g., "new-games", "popular", "all-games"
            const tilesUrl = `/api/games?category=/en/games/tiles&gameCollections=${collectionName}&pageNumber=1&pageSize=1`;
            const tilesResponse = await fetch(tilesUrl);
            if (tilesResponse.ok) {
              const tilesData = await tilesResponse.json();
              if (typeof tilesData.count === 'number') {
                extractedTotalCount = tilesData.count;
              }
            }
          } catch (error) {
            // If fetch fails, use component.total as fallback
            extractedTotalCount = typeof component.total === 'number' ? component.total : undefined;
          }
        } else {
          // No collections, use component.total as fallback
          extractedTotalCount = typeof component.total === 'number' ? component.total : undefined;
        }
      }
    }

    // Map games to our GameTile format
    const mappedGames: GameTile[] = games.map((game: unknown) => {
      const gameRecord = game as Record<string, unknown>;
      // Handle different field names from API
      const gameId = String(
        gameRecord.id || 
        gameRecord.platformId || 
        gameRecord.slug || 
        Math.random()
      );
      const gameName = String(
        gameRecord.name || 
        gameRecord.gameText || 
        gameRecord.title || 
        'Unknown Game'
      );
      
      // Handle image field - can be string or object
      let gameThumbnail = '';
      
      // First, try thumbnail field
      if (typeof gameRecord.thumbnail === 'string' && gameRecord.thumbnail) {
        gameThumbnail = gameRecord.thumbnail;
      } else if (gameRecord.thumbnail && typeof gameRecord.thumbnail === 'object') {
        // Handle thumbnail as object
        const thumbObj = gameRecord.thumbnail as Record<string, unknown>;
        gameThumbnail = String(
          thumbObj.url || 
          thumbObj.original || 
          thumbObj.small || 
          thumbObj.thumbnail || 
          ''
        );
      }
      
      // If thumbnail is empty, try image field
      if (!gameThumbnail) {
        if (typeof gameRecord.image === 'string') {
          gameThumbnail = gameRecord.image;
        } else if (gameRecord.image && typeof gameRecord.image === 'object') {
          const imageObj = gameRecord.image as Record<string, unknown>;
          // Try to get URL from nested image object
          const original = imageObj.original;
          const small = imageObj.small;
          const thumbnail = imageObj.thumbnail;
          
          // Handle nested image objects (image.original.url, etc.)
          if (original && typeof original === 'object') {
            const origObj = original as Record<string, unknown>;
            gameThumbnail = String(origObj.url || origObj.src || origObj.original || '');
          } else if (typeof original === 'string') {
            gameThumbnail = original;
          } else if (small && typeof small === 'object') {
            const smallObj = small as Record<string, unknown>;
            gameThumbnail = String(smallObj.url || smallObj.src || smallObj.small || '');
          } else if (typeof small === 'string') {
            gameThumbnail = small;
          } else if (thumbnail && typeof thumbnail === 'object') {
            const thumbObj = thumbnail as Record<string, unknown>;
            gameThumbnail = String(thumbObj.url || thumbObj.src || thumbObj.thumbnail || '');
          } else if (typeof thumbnail === 'string') {
            gameThumbnail = thumbnail;
          } else {
            // Fallback: try to stringify the first available property
            gameThumbnail = String(
              imageObj.url || 
              imageObj.src ||
              imageObj.original || 
              imageObj.small || 
              imageObj.thumbnail || 
              ''
            );
          }
        }
      }
      
      // If still empty, try providerLogo.original.src as fallback
      if (!gameThumbnail && gameRecord.providerLogo && typeof gameRecord.providerLogo === 'object') {
        const providerLogo = gameRecord.providerLogo as Record<string, unknown>;
        if (providerLogo.original && typeof providerLogo.original === 'object') {
          const original = providerLogo.original as Record<string, unknown>;
          gameThumbnail = String(original.src || original.url || '');
        }
      }
      
      // Ensure thumbnail is a valid URL string
      if (gameThumbnail && !gameThumbnail.startsWith('http') && !gameThumbnail.startsWith('/')) {
        // If it's not a valid URL, clear it
        logger.warn('Invalid thumbnail URL for game', {
          gameName,
          thumbnail: gameThumbnail,
        });
        gameThumbnail = '';
      }
      
      const gameProvider = typeof gameRecord.provider === 'string' 
        ? gameRecord.provider 
        : (typeof gameRecord.providerName === 'string' ? gameRecord.providerName : undefined);

      // Create a clean game object without image/thumbnail to avoid overwriting
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { image: _image, thumbnail: _thumbnail, ...restGame } = gameRecord;

      return {
        id: gameId,
        name: gameName,
        thumbnail: gameThumbnail,
        provider: gameProvider,
        ...restGame, // Keep all other properties except image/thumbnail
      } as GameTile;
    });

    // Extract pagination info
    const totalCount = extractedTotalCount || data.totalCount || data.total || data.count || mappedGames.length;
    const requestedPageSize = params.pageSize || 10;
    const responsePageNumber = params.pageNumber || 1;
    
    // If API returned more games than requested, limit to requested amount
    // Return all games - we'll filter and paginate on the client side
    // Don't limit here, let the client handle pagination
    const result: GamesTilesResponse = {
      games: mappedGames, // Return all games, no limit
      totalCount: totalCount || mappedGames.length, // Use total from API or all games count
      pageNumber: responsePageNumber,
      pageSize: requestedPageSize, // Keep requestedPageSize for reference, but return all games
    };

    return result;
  }, {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
  });
}

