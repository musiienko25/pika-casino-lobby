/**
 * Analytics and Event Tracking Service
 * Tracks user interactions and events
 */

export enum EventType {
  SEARCH = 'search',
  CATEGORY_SELECT = 'category_select',
  GAME_CLICK = 'game_click',
  LOAD_MORE = 'load_more',
  ERROR = 'error',
  PAGE_VIEW = 'page_view',
}

export interface AnalyticsEvent {
  type: EventType;
  name: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean;

  constructor() {
    // Enable analytics in production or when explicitly enabled
    this.isEnabled = 
      process.env.NODE_ENV === 'production' || 
      process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';
  }

  /**
   * Enable or disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Track an event
   */
  track(
    type: EventType,
    name: string,
    properties?: Record<string, unknown>
  ): void {
    if (!this.isEnabled) {
      return;
    }

    const event: AnalyticsEvent = {
      type,
      name,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);

    // Send to external analytics service (placeholder)
    this.sendToExternalService(event);

    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events.shift();
    }
  }

  /**
   * Send event to external analytics service
   * This is a placeholder for future integration with services like:
   * - Google Analytics
   * - Mixpanel
   * - Amplitude
   * - Custom analytics endpoint
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private sendToExternalService(_event: AnalyticsEvent): void {
    // In production, you might want to send to external services
    if (typeof window !== 'undefined') {
      // Example: Google Analytics 4
      // if (window.gtag) {
      //   window.gtag('event', _event.name, {
      //     event_category: _event.type,
      //     ..._event.properties,
      //   });
      // }

      // Example: Custom analytics endpoint
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(_event),
      // }).catch(() => {
      //   // Silently fail if analytics endpoint is unavailable
      // });
    }
  }

  /**
   * Track search event
   */
  trackSearch(query: string, resultCount?: number): void {
    this.track(EventType.SEARCH, 'search_games', {
      query,
      resultCount,
    });
  }

  /**
   * Track category selection
   */
  trackCategorySelect(categoryId: string, categoryName: string): void {
    this.track(EventType.CATEGORY_SELECT, 'select_category', {
      categoryId,
      categoryName,
    });
  }

  /**
   * Track game click
   */
  trackGameClick(gameId: string, gameName: string): void {
    this.track(EventType.GAME_CLICK, 'click_game', {
      gameId,
      gameName,
    });
  }

  /**
   * Track load more action
   */
  trackLoadMore(currentCount: number, newCount: number): void {
    this.track(EventType.LOAD_MORE, 'load_more_games', {
      currentCount,
      newCount,
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, unknown>): void {
    this.track(EventType.ERROR, 'error_occurred', {
      errorMessage: error.message,
      errorStack: error.stack,
      ...context,
    });
  }

  /**
   * Track page view
   */
  trackPageView(path: string): void {
    this.track(EventType.PAGE_VIEW, 'page_view', {
      path,
    });
  }

  /**
   * Get all tracked events (for debugging)
   */
  getEvents(): readonly AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = [];
  }
}

// Export singleton instance
export const analytics = typeof window !== 'undefined' ? new Analytics() : null;

