import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Force Node.js runtime
export const runtime = 'nodejs';

interface UpdateMemoryRequest {
  content: string;
  metadata?: Record<string, unknown>;
}

interface MemoryEntry {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

// Configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
const MEMORY_DIR = path.join(process.env.HOME || '', '.openclaw', 'memory', 'json-backup');

/**
 * Hybrid Memory Storage Implementation
 *
 * Strategy:
 * 1. Try OpenClaw Gateway API first (production approach)
 * 2. Fallback to local JSON files if Gateway unavailable (development/testing)
 * 3. Log the storage method used for debugging
 */

// Ensure memory directory exists
async function ensureMemoryDir() {
  try {
    await fs.mkdir(MEMORY_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create memory directory:', error);
  }
}

// Try to update via OpenClaw Gateway
async function updateViaGateway(memoryId: string, content: string, metadata?: Record<string, unknown>) {
  try {
    const response = await fetch(`${GATEWAY_URL}/api/v1/memory/${memoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, metadata }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[Gateway] Memory ${memoryId} updated successfully`);
      return { success: true, data, method: 'gateway' };
    }

    return { success: false, error: 'Gateway request failed', method: 'gateway' };
  } catch (error) {
    console.log(`[Gateway] Unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, error, method: 'gateway' };
  }
}

// Fallback: Update via local JSON file
async function updateViaLocalFile(memoryId: string, content: string, metadata?: Record<string, unknown>) {
  try {
    await ensureMemoryDir();

    const filePath = path.join(MEMORY_DIR, `${memoryId}.json`);

    // Read existing data if file exists
    let existingData: Partial<MemoryEntry> = {};
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch {
      // File doesn't exist, create new
    }

    // Update memory
    const updatedMemory: MemoryEntry = {
      id: memoryId,
      content,
      metadata: metadata || existingData.metadata || {},
      created_at: existingData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Write to file
    await fs.writeFile(filePath, JSON.stringify(updatedMemory, null, 2));

    console.log(`[Local File] Memory ${memoryId} saved to ${filePath}`);
    return { success: true, data: updatedMemory, method: 'local-file' };
  } catch (error) {
    console.error('[Local File] Failed to save memory:', error);
    return { success: false, error, method: 'local-file' };
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memoryId } = await params;
    const { content, metadata }: UpdateMemoryRequest = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Strategy: Try Gateway first, then fallback to local file
    console.log(`[Memory Update] Attempting to update memory: ${memoryId}`);

    const gatewayResult = await updateViaGateway(memoryId, content, metadata);

    if (gatewayResult.success) {
      return NextResponse.json({
        success: true,
        memory: gatewayResult.data,
        method: 'gateway',
      });
    }

    // Gateway failed, try local file fallback
    console.log('[Memory Update] Gateway unavailable, using local file fallback');
    const localResult = await updateViaLocalFile(memoryId, content, metadata);

    if (localResult.success) {
      return NextResponse.json({
        success: true,
        memory: localResult.data,
        method: 'local-file',
        warning: 'Gateway unavailable, saved to local file',
      });
    }

    // Both methods failed
    return NextResponse.json(
      {
        error: 'Failed to update memory',
        details: {
          gateway: gatewayResult.error,
          local: localResult.error,
        },
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('[Memory Update] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update memory',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memoryId } = await params;

    // Try Gateway first
    try {
      const response = await fetch(`${GATEWAY_URL}/api/v1/memory/${memoryId}`);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          ...data,
          method: 'gateway',
        });
      }
    } catch (error) {
      console.log('[Memory Get] Gateway unavailable, trying local file');
    }

    // Fallback to local file
    const filePath = path.join(MEMORY_DIR, `${memoryId}.json`);

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      return NextResponse.json({
        ...data,
        method: 'local-file',
      });
    } catch {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve memory' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memoryId } = await params;

    // Try Gateway first
    try {
      const response = await fetch(`${GATEWAY_URL}/api/v1/memory/${memoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return NextResponse.json({ success: true, id: memoryId, method: 'gateway' });
      }
    } catch (error) {
      console.log('[Memory Delete] Gateway unavailable, trying local file');
    }

    // Fallback to local file
    const filePath = path.join(MEMORY_DIR, `${memoryId}.json`);

    try {
      await fs.unlink(filePath);
      return NextResponse.json({ success: true, id: memoryId, method: 'local-file' });
    } catch {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete memory' },
      { status: 500 }
    );
  }
}
