/**
 * Next.js API Route for fetching games
 * This route acts as a proxy to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://casino.api.pikakasino.com/v1/pika';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const pageNumber = searchParams.get('pageNumber');
    const pageSize = searchParams.get('pageSize');

    // Build URL
    let url: string;
    
    if (category) {
      // If category is provided, use it as a path or parameter
      // Check if it's a full path or just a slug
      if (category.startsWith('/')) {
        // It's a path like "/casino" - construct full URL
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
    if (pageNumber) queryParams.append('pageNumber', pageNumber);
    if (pageSize) queryParams.append('pageSize', pageSize);
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
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

