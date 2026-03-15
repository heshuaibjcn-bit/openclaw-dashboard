import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useMemorySearch, useGatewayHealth, useAgents } from '../openclaw/react-hooks';

// Mock the API client module
const mockClient = {
  searchMemory: vi.fn(),
  getHealth: vi.fn(),
  getAgents: vi.fn(),
};

vi.mock('../openclaw/api-client', () => ({
  OpenClawAPIError: class extends Error {
    constructor(message: string, public statusCode?: number) {
      super(message);
      this.name = 'OpenClawAPIError';
    }
  },
  getAPIClient: () => mockClient,
}));

describe('React Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useMemorySearch', () => {
    it('initializes with empty data and no loading state', () => {
      const { result } = renderHook(() => useMemorySearch());

      expect(result.current.data).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('searches memory and returns results', async () => {
      const mockResults = [
        { id: '1', content: 'Result 1', score: 0.9 },
        { id: '2', content: 'Result 2', score: 0.8 },
      ];

      mockClient.searchMemory = vi.fn().mockResolvedValue(mockResults);

      const { result } = renderHook(() => useMemorySearch());

      await act(async () => {
        const results = await result.current.search('test query');
        expect(results).toEqual(mockResults);
      });

      expect(result.current.data).toEqual(mockResults);
      expect(result.current.loading).toBe(false);
    });

    it('handles search errors gracefully', async () => {
      const mockError = new Error('Search failed');
      mockClient.searchMemory = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useMemorySearch());

      await act(async () => {
        const results = await result.current.search('test query');
        expect(results).toEqual([]);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    it('sets loading to true during search', async () => {
      let resolveSearch: (value: Array<{ id: string; content: string; score: number }>) => void;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });

      mockClient.searchMemory = vi.fn().mockReturnValue(searchPromise);

      const { result } = renderHook(() => useMemorySearch());

      act(() => {
        result.current.search('test');
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveSearch!([]);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('useGatewayHealth', () => {
    it('fetches gateway health on mount', async () => {
      const mockHealth = {
        status: 'healthy',
        uptime: 1000,
        version: '1.0.0',
        os: 'darwin',
        nodeVersion: 'v20.0.0',
        channels: [],
        sessions: 0,
        agents: 0,
      };

      mockClient.getHealth = vi.fn().mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useGatewayHealth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockHealth);
      expect(mockClient.getHealth).toHaveBeenCalled();
    });

    it('refetches health when refetch is called', async () => {
      const mockHealth = {
        status: 'healthy',
        uptime: 2000,
        version: '1.0.0',
        os: 'darwin',
        nodeVersion: 'v20.0.0',
        channels: [],
        sessions: 1,
        agents: 1,
      };

      mockClient.getHealth = vi.fn().mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useGatewayHealth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockClient.getHealth).toHaveBeenCalledTimes(2);
      });
    });

    it('toggles auto refresh', async () => {
      mockClient.getHealth = vi.fn().mockResolvedValue({
        status: 'healthy',
        uptime: 1000,
        version: '1.0.0',
        os: 'darwin',
        nodeVersion: 'v20.0.0',
        channels: [],
        sessions: 0,
        agents: 0,
      });

      const { result } = renderHook(() => useGatewayHealth());

      expect(result.current.isAutoRefreshing).toBe(true);

      act(() => {
        result.current.toggleAutoRefresh();
      });

      expect(result.current.isAutoRefreshing).toBe(false);
    });
  });

  describe('useAgents', () => {
    it('fetches agents on mount', async () => {
      const mockAgents = [
        { id: '1', name: 'Agent 1', status: 'running' },
        { id: '2', name: 'Agent 2', status: 'idle' },
      ];

      mockClient.getAgents = vi.fn().mockResolvedValue(mockAgents);

      const { result } = renderHook(() => useAgents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockAgents);
      expect(mockClient.getAgents).toHaveBeenCalled();
    });

    it('handles fetch errors', async () => {
      const mockError = new Error('Failed to fetch agents');
      mockClient.getAgents = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useAgents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });
});
