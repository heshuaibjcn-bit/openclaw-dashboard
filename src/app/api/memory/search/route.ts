import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';

interface MemorySearchResult {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  score: number;
  createdAt?: string;
}

/**
 * Search memory through OpenClaw Gateway with semantic search
 * Falls back to local file reading if Gateway is unavailable
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Try Gateway first for real semantic search
    try {
      const gatewayResults = await searchViaGateway(query, limit);
      return NextResponse.json({
        results: gatewayResults,
        method: 'gateway',
        query,
        count: gatewayResults.length,
      });
    } catch (gatewayError) {
      // Fallback to local file search
      console.warn('Gateway unavailable, falling back to local search:', gatewayError);
      const localResults = await searchLocalFiles(query, limit);
      return NextResponse.json({
        results: localResults,
        method: 'local-fallback',
        query,
        count: localResults.length,
        warning: 'Gateway unavailable - using local fallback',
      });
    }
  } catch (error) {
    console.error('Memory search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search memory',
        results: [],
        method: 'error',
      },
      { status: 500 }
    );
  }
}

/**
 * Search via OpenClaw Gateway API
 */
async function searchViaGateway(
  query: string,
  limit: number
): Promise<MemorySearchResult[]> {
  const gatewaySearchUrl = `${GATEWAY_URL}/api/memory/search`;

  const response = await fetch(gatewaySearchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, limit }),
  });

  if (!response.ok) {
    throw new Error(`Gateway search failed: ${response.statusText}`);
  }

  const data = await response.json();

  // Transform Gateway response to our format
  return (data.results || data || []).map((item: any) => ({
    id: item.id || item.memory_id || `mem-${Date.now()}-${Math.random()}`,
    content: item.content || item.text || item.message || '',
    metadata: item.metadata || {},
    score: item.score || item.similarity || 0,
    createdAt: item.created_at || item.timestamp,
  }));
}

/**
 * Fallback: Search local memory files
 */
async function searchLocalFiles(
  query: string,
  limit: number
): Promise<MemorySearchResult[]> {
  const memoryPath = path.join(process.env.HOME || '', '.openclaw', 'memory');

  // Simple keyword-based search as fallback
  const results: MemorySearchResult[] = [];
  const queryLower = query.toLowerCase();

  try {
    // Try to read JSON memory files
    const files = await fs.readdir(memoryPath).catch(() => []);

    for (const file of files) {
      if (results.length >= limit) break;

      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(memoryPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);

          // Search in content
          const contentStr = JSON.stringify(data).toLowerCase();
          const score = calculateKeywordScore(queryLower, contentStr);

          if (score > 0) {
            results.push({
              id: file.replace('.json', ''),
              content: extractRelevantContent(data, query),
              metadata: {
                source: 'local-file',
                file: file,
              },
              score,
            });
          }
        } catch (fileError) {
          // Skip files that can't be read
          continue;
        }
      }
    }
  } catch (error) {
    // If directory doesn't exist or can't be read, return empty results
    console.warn('Local memory search failed:', error);
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Calculate simple keyword match score
 */
function calculateKeywordScore(query: string, content: string): number {
  const queryWords = query.split(/\s+/).filter(w => w.length > 2);
  if (queryWords.length === 0) return 0;

  let matches = 0;
  for (const word of queryWords) {
    if (content.includes(word)) {
      matches++;
    }
  }

  return (matches / queryWords.length) * 0.8; // Max score 0.8 for local search
}

/**
 * Extract relevant content from memory data
 */
function extractRelevantContent(data: any, query: string): string {
  if (typeof data === 'string') return data;
  if (data.content) return data.content;
  if (data.message) return data.message;
  if (data.text) return data.text;

  // Return JSON string with reasonable length
  const str = JSON.stringify(data);
  return str.length > 200 ? str.substring(0, 200) + '...' : str;
}
