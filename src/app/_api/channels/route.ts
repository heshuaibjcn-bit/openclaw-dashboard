import { NextResponse } from 'next/server';

const CHANNELS = [
  {
    id: "imessage",
    type: "imessage",
    name: "iMessage",
    nameZh: "iMessage",
    status: "connected",
    enabled: true,
    lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    messageCount: 156,
  },
  {
    id: "feishu",
    type: "feishu",
    name: "Feishu",
    nameZh: "飞书",
    status: "connected",
    enabled: true,
    lastActivity: new Date(Date.now() - 1000 * 30).toISOString(),
    messageCount: 342,
  },
  {
    id: "telegram",
    type: "telegram",
    name: "Telegram",
    nameZh: "Telegram",
    status: "disconnected",
    enabled: false,
    lastActivity: new Date(Date.now() - 86400000).toISOString(),
    messageCount: 0,
  },
  {
    id: "discord",
    type: "discord",
    name: "Discord",
    nameZh: "Discord",
    status: "disconnected",
    enabled: false,
    lastActivity: null,
    messageCount: 0,
  },
];

export async function GET() {
  return NextResponse.json(CHANNELS);
}
