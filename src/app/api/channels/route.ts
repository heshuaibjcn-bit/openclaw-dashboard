import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const configPath = path.join(process.env.HOME || '', '.openclaw', 'openclaw.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const channels = [];

    if (config.channels?.imessage?.enabled) {
      channels.push({
        id: 'imessage',
        type: 'imessage',
        name: 'iMessage',
        status: 'connected',
        enabled: true,
        messageCount: 0,
      });
    }

    if (config.channels?.feishu?.enabled) {
      channels.push({
        id: 'feishu',
        type: 'feishu',
        name: 'Feishu',
        status: 'connected',
        enabled: true,
        messageCount: 0,
      });
    }

    return NextResponse.json(channels);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
