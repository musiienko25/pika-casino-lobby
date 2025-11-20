/**
 * Next.js API Route for fetching config
 * This route acts as a proxy to avoid CORS issues
 */

import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://casino.api.pikakasino.com/v1/pika';

export async function GET() {
  try {
    const url = `${API_BASE_URL}/en/config`;

    console.log('API Route - Fetching config from:', url);

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

