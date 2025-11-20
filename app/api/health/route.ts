/**
 * Health Check Endpoint
 * Returns the health status of the application
 * Useful for monitoring and load balancers
 */

import { NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    api: 'ok' | 'degraded' | 'error';
    cache: 'ok' | 'degraded' | 'error';
  };
}

const startTime = Date.now();

export async function GET() {
  try {
    const uptime = Math.floor((Date.now() - startTime) / 1000); // seconds
    const version = process.env.npm_package_version || '0.1.0';
    const environment = process.env.NODE_ENV || 'development';

    // Check API availability (optional - can be removed if not needed)
    let apiStatus: 'ok' | 'degraded' | 'error' = 'ok';
    try {
      // Quick check to external API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('https://casino.api.pikakasino.com/v1/pika/en/config', {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      
      if (!response) {
        apiStatus = 'error';
      } else if (!response.ok) {
        apiStatus = 'degraded';
      }
    } catch {
      apiStatus = 'error';
    }

    // Check cache status (always ok for in-memory cache)
    const cacheStatus: 'ok' | 'degraded' | 'error' = 'ok';

    const checks = {
      api: apiStatus,
      cache: cacheStatus,
    };

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (apiStatus === 'error') {
      status = 'unhealthy';
    } else if (apiStatus === 'degraded') {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      uptime,
      version,
      environment,
      checks,
    };

    // Return appropriate HTTP status code
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

