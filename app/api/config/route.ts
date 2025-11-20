/**
 * Next.js API Route for fetching config
 * This route acts as a proxy to avoid CORS issues
 * Includes rate limiting and caching
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache, rateLimiter } from '@/utils/cache';
import { logger } from '@/utils/logger';

const API_BASE_URL = 'https://casino.api.pikakasino.com/v1/pika';
const CACHE_TTL = 3600000; // 1 hour cache (config changes rarely)
const RATE_LIMIT_REQUESTS = 100; // 100 requests per minute

export async function GET(request: NextRequest) {
  // Rate limiting
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

    // Check cache first
    const cacheKey = 'config:en';
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

    const url = `${API_BASE_URL}/en/config`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch config: ${response.statusText}` },
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
      { route: '/api/config', clientId }
    );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

