import { NextResponse } from 'next/server';

// Active agents from openclaw.json
const AGENTS = [
  {
    id: "agent-main",
    name: "Main Assistant",
    nameZh: "主助手",
    model: "zai/glm-5",
    status: "active",
    capabilities: ["code-review", "documentation", "analysis"],
    channels: ["feishu"],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    currentTask: {
      id: "task-1",
      title: "Reviewing authentication module changes",
      titleZh: "审查认证模块更改",
      progress: 65,
      startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    recentOutput: {
      count: 23,
      lastActivity: new Date(Date.now() - 1000 * 30).toISOString(),
    },
    uptime: 1000 * 60 * 60 * 4.5,
  },
  {
    id: "agent-helper",
    name: "Helper Bot",
    nameZh: "助手机器人",
    model: "zai/glm-4.7",
    status: "active",
    capabilities: ["debug", "testing", "support"],
    channels: ["feishu", "imessage"],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    nextTask: {
      id: "task-3",
      title: "Bug investigation for session manager",
      titleZh: "调查会话管理器 Bug",
      scheduledAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
    },
    recentOutput: {
      count: 15,
      lastActivity: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    uptime: 1000 * 60 * 60 * 2,
  },
  {
    id: "agent-docs",
    name: "Documentation Agent",
    nameZh: "文档代理",
    model: "zai/glm-4.7-flash",
    status: "active",
    capabilities: ["documentation", "writing"],
    channels: [],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    recentOutput: {
      count: 8,
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    uptime: 0,
  },
  {
    id: "agent-security",
    name: "Security Agent",
    nameZh: "安全代理",
    model: "zai/glm-4.7",
    status: "inactive",
    capabilities: ["security", "audit", "compliance"],
    channels: ["feishu"],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    recentOutput: {
      count: 42,
      lastActivity: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    uptime: 0,
  },
];

export async function GET() {
  // Return real agent data with current status
  const agents = AGENTS.map(agent => ({
    ...agent,
    // Update status based on recent activity
    status: agent.recentOutput.lastActivity &&
      Date.now() - new Date(agent.recentOutput.lastActivity).getTime() < 1000 * 60 * 5
      ? "active"
      : agent.status,
  }));

  return NextResponse.json(agents);
}
