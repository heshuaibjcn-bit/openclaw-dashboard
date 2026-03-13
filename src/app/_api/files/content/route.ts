import { NextResponse } from 'next/server';

// File contents storage (in-memory, would use actual file system in production)
const FILE_CONTENTS: Record<string, { content: string; modified: string }> = {
  "/README.md": {
    content: `# OpenClaw Dashboard

OpenClaw Dashboard is a web-based management interface for the OpenClaw Gateway system.

## Features

- **Real-time Monitoring**: Monitor gateway health, agents, sessions, and channels
- **Task Management**: Track and manage tasks across different projects
- **Memory Search**: Semantic search through agent memories
- **Usage Analytics**: View token usage and costs
- **Agent Management**: Configure and monitor AI agents

## Getting Started

1. Start the development server: \`npm run dev\`
2. Open your browser to \`http://localhost:3000\`
3. Configure your OpenClaw Gateway connection in settings

## Configuration

Edit \`openclaw.json\` to configure agents, channels, and settings.

## Support

For issues and questions, please refer to the official documentation.
`,
    modified: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  "/openclaw.json": {
    content: JSON.stringify({
      version: "1.0.0",
      agents: [
        {
          id: "agent-main",
          name: "Main Assistant",
          model: "zai/glm-5",
          status: "active",
          capabilities: ["code-review", "documentation", "analysis"],
        },
        {
          id: "agent-helper",
          name: "Helper Bot",
          model: "zai/glm-4.7",
          status: "active",
          capabilities: ["debug", "testing", "support"],
        },
      ],
      channels: [
        { id: "feishu", name: "Feishu", type: "feishu", enabled: true },
        { id: "imessage", name: "iMessage", type: "imessage", enabled: true },
      ],
      gateway: {
        url: "ws://127.0.0.1:18789",
        port: 18789,
      },
      memory: {
        enabled: true,
        provider: "lancedb",
        path: "~/.openclaw/memory",
      },
    }, null, 2),
    modified: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  "/.env": {
    content: `# OpenClaw Configuration
OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789
OPENCLAW_AUTH_TOKEN=your-auth-token-here

# API Keys (replace with actual values)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
`,
    modified: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
  }

  const file = FILE_CONTENTS[path];
  if (!file) {
    // Return default content for files not in storage
    return NextResponse.json({
      content: `# ${path.split("/").pop() || "Untitled"}

This is a placeholder file content for: ${path}

In production, this would contain the actual file content from the file system.
`,
      path,
      modified: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    content: file.content,
    path,
    modified: file.modified,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path, content } = body;

    if (!path || content === undefined) {
      return NextResponse.json(
        { error: "Path and content are required" },
        { status: 400 }
      );
    }

    // Store file content
    FILE_CONTENTS[path] = {
      content,
      modified: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      path,
      modified: FILE_CONTENTS[path].modified,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
