import { NextResponse } from 'next/server';

const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;
const LOG_SOURCES = ["gateway", "agent-main", "agent-helper", "agent-docs", "imessage", "feishu"];

const LOG_MESSAGES = [
  { level: "info", source: "gateway", message: "Gateway started successfully" },
  { level: "info", source: "agent-main", message: "Processing code review request" },
  { level: "debug", source: "agent-main", message: "Analyzing file: auth.ts" },
  { level: "warn", source: "agent-helper", message: "Connection timeout, retrying..." },
  { level: "info", source: "feishu", message: "Message received from user" },
  { level: "debug", source: "agent-docs", message: "Generating documentation" },
  { level: "info", source: "agent-main", message: "Code review completed: 3 issues found" },
  { level: "warn", source: "gateway", message: "High memory usage detected: 75%" },
  { level: "error", source: "imessage", message: "Failed to send message: Rate limit exceeded" },
  { level: "info", source: "agent-helper", message: "Bug investigation started" },
  { level: "debug", source: "agent-docs", message: "Reading configuration files" },
  { level: "info", source: "feishu", message: "Response sent successfully" },
  { level: "warn", source: "gateway", message: "Session approaching token limit" },
  { level: "info", source: "agent-main", message: "Security scan completed" },
  { level: "debug", source: "agent-helper", message: "Stack trace analyzed" },
  { level: "info", source: "agent-docs", message: "Documentation updated" },
  { level: "error", source: "gateway", message: "API request failed: Timeout" },
  { level: "warn", source: "agent-main", message: "Potential security issue detected" },
  { level: "info", source: "feishu", message: "New conversation started" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");
  const level = searchParams.get("level");

  // Generate log entries with recent timestamps
  const logs = [];
  const now = Date.now();

  for (let i = 0; i < Math.min(limit, LOG_MESSAGES.length); i++) {
    const msg = LOG_MESSAGES[(offset + i) % LOG_MESSAGES.length];
    if (level && msg.level !== level) continue;

    logs.push({
      id: `log-${now - i * 1000 * 30}`,
      level: msg.level,
      message: msg.message,
      timestamp: new Date(now - i * 1000 * 30 - Math.random() * 1000 * 60).toISOString(),
      source: msg.source,
    });
  }

  return NextResponse.json(logs);
}
