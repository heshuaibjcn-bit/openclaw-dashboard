import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface LogEntry {
  id: string;
  level: string;
  message: string;
  timestamp: string;
  source: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const logsPath = path.join(process.env.HOME || '', '.openclaw', 'logs');
    const logFiles = await fs.readdir(logsPath);

    const logs: LogEntry[] = [];

    for (const file of logFiles) {
      if (!file.endsWith('.log')) continue;

      try {
        const filePath = path.join(logsPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const logEntry = parseLogLine(line);
            if (logEntry) {
              logs.push(logEntry);
            }
          } catch {}
        }
      } catch {}
    }

    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const paginatedLogs = logs.slice(offset, offset + limit);

    return NextResponse.json(paginatedLogs);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

function parseLogLine(line: string): LogEntry | null {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(line) as Record<string, unknown>;
    if (parsed.timestamp && parsed.level && parsed.message) {
      return {
        id: `log-${Date.now()}-${Math.random()}`,
        level: String(parsed.level),
        message: String(parsed.message),
        timestamp: String(parsed.timestamp),
        source: parsed.source ? String(parsed.source) : 'openclaw',
      };
    }
  } catch {}

  // Parse as text log
  const logLevelMatch = line.match(/\[(DEBUG|INFO|WARN|ERROR)\]/i);
  const level = logLevelMatch ? logLevelMatch[1].toLowerCase() : 'info';

  return {
    id: `log-${Date.now()}-${Math.random()}`,
    level: level,
    message: line,
    timestamp: new Date().toISOString(),
    source: 'openclaw',
  };
}
