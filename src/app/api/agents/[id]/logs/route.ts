import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Readable } from 'stream';

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/agents/[id]/logs - Get agent logs
 */
export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id: agentId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Try Gateway first
    try {
      const gatewayUrl = `${GATEWAY_URL}/api/agents/${agentId}/logs?limit=${limit}&offset=${offset}`;
      const gatewayResponse = await fetch(gatewayUrl);

      if (gatewayResponse.ok) {
        const logs = await gatewayResponse.json();
        return NextResponse.json({
          logs,
          method: 'gateway',
          agentId,
        });
      }
    } catch (gatewayError) {
      console.warn('Gateway unavailable, using local fallback:', gatewayError);
    }

    // Fallback: Read from local log files
    const agentPath = path.join(process.env.HOME || '', '.openclaw', 'agents', agentId);
    const logs: any[] = [];

    try {
      // Try to find log files in common locations
      const logPaths = [
        path.join(agentPath, 'logs', 'agent.log'),
        path.join(agentPath, 'agent.log'),
        path.join(agentPath, 'output.log'),
      ];

      for (const logPath of logPaths) {
        try {
          await fs.access(logPath);
          const content = await fs.readFile(logPath, 'utf-8');
          const lines = content.split('\n').filter(line => line.trim());

          // Parse log lines
          for (const line of lines.slice(offset, offset + limit)) {
            // Try to parse as JSON first
            try {
              const logEntry = JSON.parse(line);
              logs.push({
                timestamp: logEntry.timestamp || logEntry.time || new Date().toISOString(),
                level: logEntry.level || logEntry.severity || 'info',
                message: logEntry.message || logEntry.msg || line,
                ...logEntry,
              });
            } catch {
              // Not JSON, treat as plain text
              logs.push({
                timestamp: new Date().toISOString(),
                level: 'info',
                message: line,
              });
            }
          }
          break; // Use first found log file
        } catch {
          continue; // Try next path
        }
      }

      // If no log files found, try reading from recent sessions
      if (logs.length === 0) {
        const sessionsPath = path.join(agentPath, 'sessions', 'sessions.json');
        try {
          const sessionsContent = await fs.readFile(sessionsPath, 'utf-8');
          const sessions = JSON.parse(sessionsContent);

          // Get logs from most recent session
          const sessionIds = Object.keys(sessions).sort((a, b) => {
            const aTime = new Date(sessions[b].updatedAt || 0).getTime();
            const bTime = new Date(sessions[a].updatedAt || 0).getTime();
            return aTime - bTime;
          });

          if (sessionIds.length > 0) {
            const recentSession = sessions[sessionIds[0]];
            if (recentSession.logs && Array.isArray(recentSession.logs)) {
              logs.push(...recentSession.logs.slice(offset, offset + limit));
            }
          }
        } catch {}
      }

      return NextResponse.json({
        logs,
        method: 'local-fallback',
        agentId,
        count: logs.length,
      });
    } catch (error) {
      return NextResponse.json(
        {
          logs: [],
          method: 'local-fallback',
          agentId,
          error: 'No logs available',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error getting agent logs:', error);
    return NextResponse.json(
      { error: 'Failed to get agent logs' },
      { status: 500 }
    );
  }
}
