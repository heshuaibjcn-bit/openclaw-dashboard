import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface MemoryEntry {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  score: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Try to read from LanceDB memory store
    const memoryPath = path.join(process.env.HOME || '', '.openclaw', 'memory', 'lancedb-pro');

    const memories: MemoryEntry[] = [];

    try {
      // Check if memory directory exists
      await fs.access(memoryPath);

      // For now, return a sample memory entry
      // In production, you would query LanceDB here
      memories.push({
        id: 'mem-1',
        content: 'Sample memory entry from OpenClaw',
        metadata: {
          type: 'conversation',
          importance: 0.8,
          agent: 'main',
        },
        createdAt: new Date().toISOString(),
        score: 0.85,
      });
    } catch {}

    const paginatedMemories = memories.slice(offset, offset + limit);

    return NextResponse.json(paginatedMemories);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await request.json();

    // Search memory logic would go here
    // For now, return empty results
    return NextResponse.json([]);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
