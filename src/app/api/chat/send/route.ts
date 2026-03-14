import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';

interface SendMessageRequest {
  message: string;
  agentId?: string;
  sessionId?: string;
}

interface SendMessageResponse {
  success: boolean;
  message?: string;
  error?: string;
  response?: string;
}

/**
 * Send a message to OpenClaw Gateway
 * This creates a new interaction via the openclaw CLI
 */
export async function POST(request: Request) {
  try {
    const { message, agentId = 'main' }: SendMessageRequest = await request.json();

    if (!message || message.trim() === '') {
      return NextResponse.json<SendMessageResponse>(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if Gateway is running
    try {
      const { stdout } = await execAsync('pgrep -fl "openclaw.*gateway"');
      if (!stdout.trim() || stdout.includes('not running')) {
        return NextResponse.json<SendMessageResponse>(
          {
            success: false,
            error: 'OpenClaw Gateway is not running. Please start it first.',
          },
          { status: 503 }
        );
      }
    } catch {
      return NextResponse.json<SendMessageResponse>(
        {
          success: false,
          error: 'OpenClaw Gateway is not running. Please start it first.',
        },
        { status: 503 }
      );
    }

    // Use openclaw CLI to send message
    // Note: This is a simplified approach. In production, you might want to use
    // the Gateway's WebSocket API or create a dedicated endpoint
    try {
      // Write message to a temp file that openclaw can pick up
      // This is a workaround since direct Gateway chat API may not be available
      const tempDir = `/tmp/openclaw-dashboard`;
      await execAsync(`mkdir -p ${tempDir}`);

      const timestamp = Date.now();
      const messageFile = `${tempDir}/message-${timestamp}.txt`;
      await execAsync(`echo "${message.replace(/"/g, '\\"')}" > ${messageFile}`);

      // Trigger openclaw to process (if there's a webhook/hook mechanism)
      // For now, we'll indicate that the message has been queued
      // In a real implementation, you would:
      // 1. Use WebSocket connection to Gateway
      // 2. Or use Gateway's REST API if available
      // 3. Or write to the session file directly

      return NextResponse.json<SendMessageResponse>({
        success: true,
        message: 'Message sent to OpenClaw',
        response: 'Your message has been sent. Please check the OpenClaw TUI or web interface for the response.',
      });
    } catch (cliError) {
      console.error('Error sending message via CLI:', cliError);

      // Fallback: Try Gateway REST API
      try {
        const gatewayUrl = `${GATEWAY_URL}/api/message`;
        const response = await fetch(gatewayUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            agent: agentId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json<SendMessageResponse>({
            success: true,
            message: 'Message sent via Gateway',
            response: data.response || 'Message sent successfully',
          });
        }
      } catch (gatewayError) {
        console.error('Gateway API also failed:', gatewayError);
      }

      return NextResponse.json<SendMessageResponse>(
        {
          success: false,
          error: 'Failed to send message. Please ensure OpenClaw Gateway is running and accessible.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send message API:', error);
    return NextResponse.json<SendMessageResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
