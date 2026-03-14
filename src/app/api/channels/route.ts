import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface OpenClawConfig {
  channels?: {
    imessage?: {
      enabled: boolean;
      cliPath?: string;
      dmPolicy?: string;
      groupPolicy?: string;
    };
    feishu?: {
      enabled: boolean;
      appId?: string;
      connectionMode?: string;
      domain?: string;
      groupPolicy?: string;
    };
  };
}

export async function GET() {
  try {
    const configPath = path.join(process.env.HOME || '', '.openclaw', 'openclaw.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config: OpenClawConfig = JSON.parse(configContent);

    const channels = [];
    const now = Date.now();

    // iMessage channel
    if (config.channels?.imessage?.enabled) {
      channels.push({
        id: 'imessage',
        type: 'imessage',
        name: 'iMessage',
        status: 'connected', // TODO: Check actual connection status
        enabled: true,
        config: {
          cliPath: config.channels.imessage.cliPath || 'imsg',
          dmPolicy: config.channels.imessage.dmPolicy || 'unknown',
          groupPolicy: config.channels.imessage.groupPolicy || 'unknown',
        },
        messageCount: 0,
        lastActivity: new Date(now).toISOString(),
      });
    }

    // Feishu channel
    if (config.channels?.feishu?.enabled) {
      channels.push({
        id: 'feishu',
        type: 'feishu',
        name: 'Feishu',
        status: 'connected', // TODO: Check actual connection status
        enabled: true,
        config: {
          appId: config.channels.feishu.appId || '',
          connectionMode: config.channels.feishu.connectionMode || 'unknown',
          domain: config.channels.feishu.domain || 'feishu',
          groupPolicy: config.channels.feishu.groupPolicy || 'unknown',
        },
        messageCount: 0,
        lastActivity: new Date(now).toISOString(),
      });
    }

    return NextResponse.json(channels);
  } catch (error) {
    console.error('Error reading channels:', error);
    return NextResponse.json([], { status: 500 });
  }
}
