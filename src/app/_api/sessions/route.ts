import { NextResponse } from 'next/server';

const SESSIONS = [
  {
    id: "sess-1",
    agentId: "agent-main",
    model: "zai/glm-5",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    lastActivity: new Date(Date.now() - 1000 * 15).toISOString(),
    tokens: {
      input: 1234,
      output: 5678,
      total: 6912,
      max: 100000,
    },
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Review the authentication module PR",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        tokens: 15,
      },
      {
        id: "msg-2",
        role: "assistant",
        content: "I'll review the authentication module changes...",
        timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
        tokens: 1234,
      },
    ],
  },
  {
    id: "sess-2",
    agentId: "agent-helper",
    model: "zai/glm-4.7",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    lastActivity: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    tokens: {
      input: 890,
      output: 3456,
      total: 4346,
      max: 100000,
    },
    messages: [],
  },
  {
    id: "sess-3",
    agentId: "agent-docs",
    model: "zai/glm-4.7-flash",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    lastActivity: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
    tokens: {
      input: 2345,
      output: 6789,
      total: 9134,
      max: 100000,
    },
    messages: [],
  },
];

export async function GET() {
  return NextResponse.json(SESSIONS);
}
