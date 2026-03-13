import { NextResponse } from 'next/server';

export async function GET() {
  const now = Date.now();

  // Get real agent status
  const agentsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/agents`);
  const agents = await agentsResponse.json();

  // Build runtime data
  const agentStatuses: Record<string, any> = {};
  agents.forEach((agent: any) => {
    const isActive = agent.status === "active";
    const hasRecentActivity = agent.recentOutput &&
      Date.now() - new Date(agent.recentOutput.lastActivity).getTime() < 1000 * 60 * 5;

    agentStatuses[agent.id] = {
      status: hasRecentActivity ? "working" : isActive ? "standby" : "offline",
      currentTask: agent.currentTask,
      nextTask: agent.nextTask,
      recentOutput: agent.recentOutput,
      uptime: agent.uptime || 0,
    };
  });

  return NextResponse.json({
    timestamp: now,
    pendingItems: [
      {
        id: "pending-1",
        type: "approval",
        title: "API key change request",
        titleZh: "API 密钥更改请求",
        description: "Request to update API key for production environment",
        descriptionZh: "请求更新生产环境的 API 密钥",
        severity: "high",
        timestamp: new Date(now - 1000 * 60 * 15).toISOString(),
        source: "agent-main",
      },
      {
        id: "pending-2",
        type: "exception",
        title: "Session timeout error",
        titleZh: "会话超时错误",
        description: "Agent session exceeded maximum duration",
        descriptionZh: "代理会话超过最大持续时间",
        severity: "medium",
        timestamp: new Date(now - 1000 * 60 * 45).toISOString(),
        source: "agent-helper",
      },
      {
        id: "pending-3",
        type: "alert",
        title: "Memory usage warning",
        titleZh: "内存使用警告",
        description: "LanceDB memory index approaching size limit",
        descriptionZh: "LanceDB 内存索引接近大小限制",
        severity: "low",
        timestamp: new Date(now - 1000 * 60 * 60).toISOString(),
        source: "system",
      },
    ],
    risks: [
      {
        id: "risk-1",
        type: "budget",
        title: "Token budget running low",
        titleZh: "令牌预算不足",
        description: "Current window at 72% capacity with 3 days remaining",
        descriptionZh: "当前窗口已使用 72%，还剩 3 天",
        severity: "medium",
        affected: ["agent-main", "agent-helper"],
      },
      {
        id: "risk-2",
        type: "stalled",
        title: "Documentation task stalled",
        titleZh: "文档任务停滞",
        description: "Task 'Generate API docs' has been in progress for 4 hours",
        descriptionZh: "任务'生成 API 文档'已进行 4 小时",
        severity: "low",
        affected: ["agent-docs"],
      },
    ],
    agentStatuses,
    systemMetrics: {
      cpuUsage: Math.random() * 30 + 10, // 10-40%
      memoryUsage: Math.random() * 40 + 30, // 30-70%
      diskUsage: Math.random() * 20 + 40, // 40-60%
      networkLatency: Math.floor(Math.random() * 50 + 10), // 10-60ms
    },
  });
}
