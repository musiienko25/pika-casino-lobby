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

const API_BASE_URL = 'https://casino.api.pikakasino.com/v1/pika';

/**
 * Fetches the configuration including menu lobby categories
 * @returns Promise with categories array
 */
export async function fetchConfig(): Promise<Category[]> {
  try {
    // Use Next.js API route to avoid CORS issues
    const response = await fetch('/api/config');

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
          };
          return {
            id: menuItem.id || menuItem.slug || String(Math.random()),
            name: menuItem.title || menuItem.name || menuItem.label || 'Unnamed Category',
            getPage: menuItem.getPage || menuItem.url || menuItem.path || '',
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

    console.warn('Unexpected config response structure:', data);
    return [];
  } catch (error) {
    console.error('Error fetching config:', error);
    throw error;
  }
}

/**
 * Fetches games tiles with optional search and pagination
 * @param params - Query parameters for filtering and pagination
 * @returns Promise with games array
 */
export async function fetchGamesTiles(
  params: GamesTilesParams = {}
): Promise<GamesTilesResponse> {
  try {
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
  } catch (error) {
    console.error('Error fetching games tiles:', error);
    throw error;
  }
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
  try {
    // Log the getPageUrl to debug
    console.log('fetchCategoryGames called with getPageUrl:', getPageUrl);
    
    // Use Next.js API route to avoid CORS issues
    // The API route will handle the actual fetch to the external API
    const searchParams = new URLSearchParams();
    
    // Extract category slug from getPageUrl
    // getPageUrl might be like "/casino" or "casino" or a full URL
    let categorySlug = getPageUrl;
    if (getPageUrl.startsWith('http://') || getPageUrl.startsWith('https://')) {
      // Extract slug from full URL
      const urlObj = new URL(getPageUrl);
      categorySlug = urlObj.pathname.replace(/^\/en\//, '').replace(/^\//, '');
    } else if (getPageUrl.startsWith('/')) {
      categorySlug = getPageUrl.slice(1); // Remove leading slash
    }
    
    // Use our Next.js API route as proxy
    searchParams.append('category', categorySlug);
    
    if (params.search) {
      searchParams.append('search', params.search);
    }
    
    if (params.pageNumber !== undefined) {
      searchParams.append('pageNumber', params.pageNumber.toString());
    }
    
    if (params.pageSize !== undefined) {
      searchParams.append('pageSize', params.pageSize.toString());
    }

    const queryString = searchParams.toString();
    const apiUrl = `/api/games?${queryString}`;
    
    console.log('Fetching games via API route:', apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        body: errorText,
      });
      throw new Error(`Failed to fetch category games: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Games response structure:', {
      keys: Object.keys(data),
      hasGames: 'games' in data,
      hasItems: 'items' in data,
      sample: JSON.stringify(data).substring(0, 500),
    });

    // Handle different response structures
    let games: GameTile[] = [];
    
    if (Array.isArray(data)) {
      // If response is directly an array
      games = data;
    } else if (Array.isArray(data.games)) {
      games = data.games;
    } else if (Array.isArray(data.items)) {
      games = data.items;
    } else if (Array.isArray(data.data)) {
      games = data.data;
    }

    // Map games to our GameTile format
    const mappedGames: GameTile[] = games.map((game: Record<string, unknown>, index: number) => {
      // Handle different field names from API
      const gameId = String(
        game.id || 
        game.platformId || 
        game.slug || 
        Math.random()
      );
      const gameName = String(
        game.name || 
        game.gameText || 
        game.title || 
        'Unknown Game'
      );
      
      // Handle image field - can be string or object
      let gameThumbnail = '';
      if (typeof game.image === 'string') {
        gameThumbnail = game.image;
      } else if (game.image && typeof game.image === 'object') {
        const imageObj = game.image as Record<string, unknown>;
        // Try to get URL from nested image object
        const original = imageObj.original;
        const small = imageObj.small;
        const thumbnail = imageObj.thumbnail;
        
        // Handle nested image objects (image.original.url, etc.)
        if (original && typeof original === 'object') {
          const origObj = original as Record<string, unknown>;
          gameThumbnail = String(origObj.url || origObj.original || '');
        } else if (typeof original === 'string') {
          gameThumbnail = original;
        } else if (small && typeof small === 'object') {
          const smallObj = small as Record<string, unknown>;
          gameThumbnail = String(smallObj.url || smallObj.small || '');
        } else if (typeof small === 'string') {
          gameThumbnail = small;
        } else if (thumbnail && typeof thumbnail === 'object') {
          const thumbObj = thumbnail as Record<string, unknown>;
          gameThumbnail = String(thumbObj.url || thumbObj.thumbnail || '');
        } else if (typeof thumbnail === 'string') {
          gameThumbnail = thumbnail;
        } else {
          // Fallback: try to stringify the first available property
          gameThumbnail = String(
            imageObj.url || 
            imageObj.original || 
            imageObj.small || 
            imageObj.thumbnail || 
            ''
          );
        }
      } else if (typeof game.thumbnail === 'string') {
        gameThumbnail = game.thumbnail;
      } else if (game.thumbnail && typeof game.thumbnail === 'object') {
        // Handle thumbnail as object
        const thumbObj = game.thumbnail as Record<string, unknown>;
        gameThumbnail = String(
          thumbObj.url || 
          thumbObj.original || 
          thumbObj.small || 
          thumbObj.thumbnail || 
          ''
        );
      }
      
      // Ensure thumbnail is a valid URL string
      if (gameThumbnail && !gameThumbnail.startsWith('http') && !gameThumbnail.startsWith('/')) {
        // If it's not a valid URL, clear it
        console.warn('Invalid thumbnail URL for game:', gameName, 'thumbnail:', gameThumbnail);
        gameThumbnail = '';
      }
      
      // Log first game's image structure for debugging
      if (index === 0) {
        console.log('Sample game image structure:', {
          image: game.image,
          thumbnail: game.thumbnail,
          mappedThumbnail: gameThumbnail,
        });
      }
      
      const gameProvider = typeof game.provider === 'string' 
        ? game.provider 
        : (typeof game.providerName === 'string' ? game.providerName : undefined);

      // Create a clean game object without image/thumbnail to avoid overwriting
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { image: _image, thumbnail: _thumbnail, ...restGame } = game;

      return {
        id: gameId,
        name: gameName,
        thumbnail: gameThumbnail,
        provider: gameProvider,
        ...restGame, // Keep all other properties except image/thumbnail
      } as GameTile;
    });

    // Extract pagination info
    const totalCount = data.totalCount || data.total || data.count || mappedGames.length;
    const requestedPageSize = params.pageSize || 10;
    const responsePageNumber = params.pageNumber || 1;
    
    // If API returned more games than requested, limit to requested amount
    // This handles the case where API returns all games regardless of pageSize
    let resultGames = mappedGames;
    if (mappedGames.length > requestedPageSize) {
      // API returned all games, limit to requested pageSize
      resultGames = mappedGames.slice(0, requestedPageSize);
      console.log('API returned more games than requested, limiting:', {
        returned: mappedGames.length,
        requested: requestedPageSize,
        limited: resultGames.length,
      });
    }

    const result: GamesTilesResponse = {
      games: resultGames,
      totalCount: totalCount || mappedGames.length, // Use total from API or all games count
      pageNumber: responsePageNumber,
      pageSize: requestedPageSize,
    };

    console.log('Mapped games:', { 
      count: mappedGames.length,
      returned: resultGames.length,
      requested: requestedPageSize,
      totalCount,
    });
    return result;
  } catch (error) {
    console.error('Error fetching category games:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error fetching category games');
  }
}

