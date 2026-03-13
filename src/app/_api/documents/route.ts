import { NextResponse } from 'next/server';

// Generate document structure based on agent
function generateDocuments(agentId?: string) {
  const now = Date.now();

  const mainDocuments = [
    {
      name: "README.md",
      path: "/README.md",
      type: "file",
      size: 2048,
      modified: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      name: "openclaw.json",
      path: "/openclaw.json",
      type: "file",
      size: 4096,
      modified: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      name: ".env",
      path: "/.env",
      type: "file",
      size: 512,
      modified: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      name: "config",
      path: "/config",
      type: "folder",
      children: [
        {
          name: "channels.json",
          path: "/config/channels.json",
          type: "file",
          size: 1024,
          modified: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
        },
        {
          name: "models.json",
          path: "/config/models.json",
          type: "file",
          size: 2048,
          modified: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
        },
        {
          name: "agents",
          path: "/config/agents",
          type: "folder",
          children: [
            {
              name: "main.json",
              path: "/config/agents/main.json",
              type: "file",
              size: 1536,
              modified: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
            },
            {
              name: "helper.json",
              path: "/config/agents/helper.json",
              type: "file",
              size: 1280,
              modified: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
            },
          ],
        },
      ],
    },
  ];

  const agentDocuments: Record<string, any[]> = {
    "agent-main": [
      {
        name: "system-prompt.md",
        path: "/agent-main/system-prompt.md",
        type: "file",
        agent: "agent-main",
        size: 3072,
        modified: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
      },
      {
        name: "knowledge-base",
        path: "/agent-main/knowledge-base",
        type: "folder",
        agent: "agent-main",
        children: [
          {
            name: "code-review-guidelines.md",
            path: "/agent-main/knowledge-base/code-review-guidelines.md",
            type: "file",
            agent: "agent-main",
            size: 4096,
            modified: new Date(now - 1000 * 60 * 60 * 10).toISOString(),
          },
          {
            name: "project-context.md",
            path: "/agent-main/knowledge-base/project-context.md",
            type: "file",
            agent: "agent-main",
            size: 2048,
            modified: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
          },
          {
            name: "best-practices.md",
            path: "/agent-main/knowledge-base/best-practices.md",
            type: "file",
            agent: "agent-main",
            size: 2560,
            modified: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
          },
        ],
      },
      {
        name: "tools.md",
        path: "/agent-main/tools.md",
        type: "file",
        agent: "agent-main",
        size: 1536,
        modified: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      },
    ],
    "agent-helper": [
      {
        name: "system-prompt.md",
        path: "/agent-helper/system-prompt.md",
        type: "file",
        agent: "agent-helper",
        size: 2560,
        modified: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        name: "knowledge-base",
        path: "/agent-helper/knowledge-base",
        type: "folder",
        agent: "agent-helper",
        children: [
          {
            name: "debugging-techniques.md",
            path: "/agent-helper/knowledge-base/debugging-techniques.md",
            type: "file",
            agent: "agent-helper",
            size: 3072,
            modified: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
          },
          {
            name: "common-errors.md",
            path: "/agent-helper/knowledge-base/common-errors.md",
            type: "file",
            agent: "agent-helper",
            size: 2048,
            modified: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
          },
        ],
      },
      {
        name: "test-procedures.md",
        path: "/agent-helper/test-procedures.md",
        type: "file",
        agent: "agent-helper",
        size: 1792,
        modified: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
      },
    ],
    "agent-docs": [
      {
        name: "system-prompt.md",
        path: "/agent-docs/system-prompt.md",
        type: "file",
        agent: "agent-docs",
        size: 2048,
        modified: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      },
      {
        name: "knowledge-base",
        path: "/agent-docs/knowledge-base",
        type: "folder",
        agent: "agent-docs",
        children: [
          {
            name: "writing-style-guide.md",
            path: "/agent-docs/knowledge-base/writing-style-guide.md",
            type: "file",
            agent: "agent-docs",
            size: 2560,
            modified: new Date(now - 1000 * 60 * 60 * 18).toISOString(),
          },
          {
            name: "api-templates.md",
            path: "/agent-docs/knowledge-base/api-templates.md",
            type: "file",
            agent: "agent-docs",
            size: 3072,
            modified: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
          },
        ],
      },
      {
        name: "documentation-standards.md",
        path: "/agent-docs/documentation-standards.md",
        type: "file",
        agent: "agent-docs",
        size: 1536,
        modified: new Date(now - 1000 * 60 * 60 * 10).toISOString(),
      },
    ],
  };

  if (agentId) {
    return agentDocuments[agentId] || [];
  }

  return {
    main: mainDocuments,
    ...agentDocuments,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agent = searchParams.get("agent");

  const documents = generateDocuments(agent || undefined);

  return NextResponse.json(documents);
}
