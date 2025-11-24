/**
 * Next.js API Route for fetching games
 * This route acts as a proxy to avoid CORS issues
 * Includes rate limiting and caching
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache, rateLimiter } from '@/utils/cache';
import { logger } from '@/utils/logger';

const API_BASE_URL = 'https://casino.api.pikakasino.com/v1/pika';
const CACHE_TTL = 60000; // 1 minute cache
const RATE_LIMIT_REQUESTS = 100; // 100 requests per minute

export async function GET(request: NextRequest) {
  // Rate limiting - use IP address or a default key
  const clientId = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  try {
    
    if (!rateLimiter.isAllowed(clientId)) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT_REQUESTS),
            'X-RateLimit-Remaining': String(rateLimiter.getRemaining(clientId)),
          },
        }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const pageNumber = searchParams.get('pageNumber');
    const pageSize = searchParams.get('pageSize');
    const gameCollections = searchParams.get('gameCollections');

    // Create cache key from request parameters (include gameCollections for proper caching)
    const cacheKey = `games:${category || 'all'}:${gameCollections || ''}:${search || ''}:${pageNumber || '1'}:${pageSize || '10'}`;

    // Check cache first
    const cachedData = cache.get<unknown>(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'X-Cache': 'HIT',
          'X-RateLimit-Limit': String(RATE_LIMIT_REQUESTS),
          'X-RateLimit-Remaining': String(rateLimiter.getRemaining(clientId)),
        },
      });
    }

    // Build URL
    let url: string;
    
    if (category) {
      // If category is provided, use it as a path
      // Category can be like "/casino", "/pages/en/casino", or "/pages/en/casino/new-games"
      if (category.startsWith('/')) {
        // It's a path - construct full URL
        url = `${API_BASE_URL}${category}`;
      } else {
        // It's a slug - use /en/games/tiles with category parameter
        url = `${API_BASE_URL}/en/games/tiles`;
      }
    } else {
      url = `${API_BASE_URL}/en/games/tiles`;
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    
    // Check if endpoint supports pagination
    // /en/games/tiles supports pagination, but /pages/en/casino/* endpoints don't
    const supportsPagination = !category || 
                               category.includes('/en/games/tiles') || 
                               category === '/casino' || 
                               category === '/pages/en/casino';
    
    // Only add pagination parameters if endpoint supports them
    if (supportsPagination) {
      if (pageNumber) queryParams.append('pageNumber', pageNumber);
      if (pageSize) queryParams.append('pageSize', pageSize);
    }
    // For /pages/en/casino/* endpoints, don't pass pagination - they return all games
    
    // Add gameCollections parameter for /en/games/tiles endpoint
    if (gameCollections) {
      queryParams.append('gameCollections', gameCollections);
    }
    // Only add category as query param if it's not a path
    if (category && !category.startsWith('/')) {
      queryParams.append('category', category);
    }

    const queryString = queryParams.toString();
    const finalUrl = `${url}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(finalUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch games: ${response.statusText}` },
        { 
          status: response.status,
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMIT_REQUESTS),
            'X-RateLimit-Remaining': String(rateLimiter.getRemaining(clientId)),
          },
        }
      );
    }

    const data = await response.json();
    
    // Cache the response
    cache.set(cacheKey, data, CACHE_TTL);

    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'X-RateLimit-Limit': String(RATE_LIMIT_REQUESTS),
        'X-RateLimit-Remaining': String(rateLimiter.getRemaining(clientId)),
      },
    });
  } catch (error) {
    logger.error(
      'API route error',
      error instanceof Error ? error : new Error(String(error)),
      { route: '/api/games', clientId }
    );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

