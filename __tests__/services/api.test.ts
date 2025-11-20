/**
 * Unit tests for API service
 */

import { fetchConfig, fetchGamesTiles } from '@/services/api';

// Mock fetch globally
global.fetch = jest.fn();

// Mock retryWithBackoff to avoid delays in tests
jest.mock('@/utils/retry', () => ({
  retryWithBackoff: (fn: () => Promise<unknown>) => fn(),
}));

describe('API Service', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('fetchConfig', () => {
    it('should fetch and return categories (client-side)', async () => {
      const mockConfigResponse = {
        menu: {
          lobby: {
            items: [
              { 
                id: '1', 
                title: 'Slots', 
                getPage: '/en/games/slots',
              },
              { 
                id: '2', 
                title: 'Table Games', 
                getPage: '/en/games/table',
              },
            ],
          },
        },
      };

      const mockCategories = [
        { id: '1', name: 'Slots', getPage: '/en/games/slots' },
        { id: '2', name: 'Table Games', getPage: '/en/games/table' },
      ];

      // Mock client-side: calls /api/config (window is defined in jsdom)
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfigResponse,
      });

      const result = await fetchConfig();

      expect(fetch).toHaveBeenCalledWith(
        '/api/config',
        expect.objectContaining({
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0',
          },
        })
      );
      expect(result).toEqual(mockCategories);
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(fetchConfig()).rejects.toThrow('Failed to fetch config');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchConfig()).rejects.toThrow('Network error');
    });
  });

  describe('fetchGamesTiles', () => {
    it('should fetch games with search query (client-side)', async () => {
      const mockGames = {
        games: [
          { id: '1', name: 'Game 1', thumbnail: 'thumb1.jpg' },
          { id: '2', name: 'Game 2', thumbnail: 'thumb2.jpg' },
        ],
        totalCount: 2,
      };

      // Mock client-side: calls /api/games (window is defined in jsdom)
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGames,
      });

      const result = await fetchGamesTiles({ search: 'test', pageNumber: 1 });

      expect(fetch).toHaveBeenCalledWith(
        '/api/games?search=test&pageNumber=1'
      );
      expect(result.games).toEqual(mockGames.games);
      expect(result.totalCount).toBe(2);
    });

    it('should fetch games without parameters (client-side)', async () => {
      const mockGames = { games: [], totalCount: 0 };

      // Mock client-side: calls /api/games (window is defined in jsdom)
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGames,
      });

      const result = await fetchGamesTiles();

      expect(fetch).toHaveBeenCalledWith('/api/games');
      expect(result.games).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });
});

