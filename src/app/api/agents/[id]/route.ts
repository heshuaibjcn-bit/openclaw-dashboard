import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/agents/[id] - Get detailed agent information including sessions
 */
export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id: agentId } = await params;

    // Try Gateway first
    try {
      const gatewayResponse = await fetch(`${GATEWAY_URL}/api/agents/${agentId}`);
      if (gatewayResponse.ok) {
        const agentData = await gatewayResponse.json();
        return NextResponse.json({
          ...agentData,
          method: 'gateway',
        });
      }
    } catch (gatewayError) {
      console.warn('Gateway unavailable, using local fallback:', gatewayError);
    }

    // Fallback: Read from local files
    const agentPath = path.join(process.env.HOME || '', '.openclaw', 'agents', agentId);

    // Check if agent directory exists
    try {
      await fs.access(agentPath);
    } catch {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Read models.json
    let model = 'unknown';
    try {
      const modelsPath = path.join(agentPath, 'agent', 'models.json');
      const modelsContent = await fs.readFile(modelsPath, 'utf-8');
      const models = JSON.parse(modelsContent);
      model = models.length > 0 ? models[0].id : 'unknown';
    } catch {}

    // Read sessions
    const sessions: any[] = [];
    try {
      const sessionsPath = path.join(agentPath, 'sessions', 'sessions.json');
      const sessionsContent = await fs.readFile(sessionsPath, 'utf-8');
      const sessionsData = JSON.parse(sessionsContent);

      // Transform sessions to array format
      for (const [sessionId, sessionData] of Object.entries(sessionsData)) {
        sessions.push({
          id: sessionId,
          ...(sessionData as object),
        });
      }

      // Sort by updatedAt descending
      sessions.sort((a, b) => {
        const aTime = new Date((a as any).updatedAt || 0).getTime();
        const bTime = new Date((b as any).updatedAt || 0).getTime();
        return bTime - aTime;
      });
    } catch {}

    return NextResponse.json({
      id: agentId,
      name: agentId.charAt(0).toUpperCase() + agentId.slice(1),
      model,
      sessions,
      method: 'local-fallback',
    });
  } catch (error) {
    console.error('Error getting agent details:', error);
    return NextResponse.json(
      { error: 'Failed to get agent details' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/[id] - Control agent (start/stop)
 */
export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();
    const { action } = body; // 'start' or 'stop'

    if (action !== 'start' && action !== 'stop') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "start" or "stop"' },
        { status: 400 }
      );
    }

    // Try Gateway first
    try {
      const gatewayResponse = await fetch(`${GATEWAY_URL}/api/agents/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (gatewayResponse.ok) {
        const result = await gatewayResponse.json();
        return NextResponse.json({
          ...result,
          method: 'gateway',
        });
      }
    } catch (gatewayError) {
      console.warn('Gateway unavailable, using local fallback:', gatewayError);
    }

    // Fallback: Use local commands
    if (action === 'start') {
      try {
        // Start agent via openclaw CLI
        const { stdout, stderr } = await execAsync(`openclaw agent start ${agentId}`);
        return NextResponse.json({
          success: true,
          message: `Agent ${agentId} started successfully`,
          agentId,
          method: 'local-cli',
          output: stdout,
        });
      } catch (execError: any) {
        return NextResponse.json(
          {
            error: 'Failed to start agent',
            details: execError.message,
            method: 'local-cli',
          },
          { status: 500 }
        );
      }
    } else if (action === 'stop') {
      try {
        // Stop agent via openclaw CLI
        const { stdout, stderr } = await execAsync(`openclaw agent stop ${agentId}`);
        return NextResponse.json({
          success: true,
          message: `Agent ${agentId} stopped successfully`,
          agentId,
          method: 'local-cli',
          output: stdout,
        });
      } catch (execError: any) {
        return NextResponse.json(
          {
            error: 'Failed to stop agent',
            details: execError.message,
            method: 'local-cli',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error controlling agent:', error);
    return NextResponse.json(
      { error: 'Failed to control agent' },
      { status: 500 }
    );
  }
}
