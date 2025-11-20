/**
 * Unit tests for API service
 */

import { fetchConfig, fetchGamesTiles } from '@/services/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('fetchConfig', () => {
    it('should fetch and return categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Slots', getPage: '/en/games/slots' },
        { id: '2', name: 'Table Games', getPage: '/en/games/table' },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: mockCategories }),
      });

      const result = await fetchConfig();

      expect(fetch).toHaveBeenCalledWith(
        'https://casino.api.pikakasino.com/v1/pika/en/config',
        expect.objectContaining({
          next: { revalidate: 3600 },
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
    it('should fetch games with search query', async () => {
      const mockGames = {
        games: [
          { id: '1', name: 'Game 1', thumbnail: 'thumb1.jpg' },
          { id: '2', name: 'Game 2', thumbnail: 'thumb2.jpg' },
        ],
        totalCount: 2,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGames,
      });

      const result = await fetchGamesTiles({ search: 'test', pageNumber: 1 });

      expect(fetch).toHaveBeenCalledWith(
        'https://casino.api.pikakasino.com/v1/pika/en/games/tiles?search=test&pageNumber=1',
        expect.any(Object)
      );
      expect(result).toEqual(mockGames);
    });

    it('should fetch games without parameters', async () => {
      const mockGames = { games: [], totalCount: 0 };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGames,
      });

      const result = await fetchGamesTiles();

      expect(fetch).toHaveBeenCalledWith(
        'https://casino.api.pikakasino.com/v1/pika/en/games/tiles',
        expect.any(Object)
      );
      expect(result).toEqual(mockGames);
    });
  });
});

