/**
 * API service for fetching data from Pika Casino API
 */

import type {
  Category,
  ConfigResponse,
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
    const response = await fetch(`${API_BASE_URL}/en/config`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`);
    }

    const data: ConfigResponse = await response.json();
    
    // Extract categories from the response
    // The API might return categories in different formats, so we handle both
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

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/en/games/tiles${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every minute
    });

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
    // If getPageUrl is a full URL, use it directly; otherwise construct it
    const baseUrl = getPageUrl.startsWith('http') 
      ? getPageUrl 
      : `${API_BASE_URL}${getPageUrl.startsWith('/') ? '' : '/'}${getPageUrl}`;

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

    const queryString = searchParams.toString();
    const url = `${baseUrl}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every minute
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch category games: ${response.statusText}`);
    }

    const data: GamesTilesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching category games:', error);
    throw error;
  }
}

