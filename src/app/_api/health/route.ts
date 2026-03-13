import { NextResponse } from 'next/server';

export async function GET() {
  const now = Date.now();
  const startTime = now - 1234567; // Started ~14 minutes ago

  return NextResponse.json({
    status: "healthy",
    uptime: Math.floor((now - startTime) / 1000),
    version: "2026.3.13",
    os: "macOS 15.3",
    nodeVersion: "v22.11.0",
    channels: [
      { name: "iMessage", enabled: true, status: "OK" },
      { name: "Feishu", enabled: true, status: "OK" },
      { name: "Telegram", enabled: false, status: "Disabled" },
    ],
    sessions: 3,
    agents: 4,
  });
}
