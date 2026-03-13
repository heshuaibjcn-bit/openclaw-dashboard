import { NextResponse } from 'next/server';

export async function GET() {
  const now = Date.now();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();

  // Calculate usage for current month
  const dailyAverage = 45000;
  const usedTokens = dailyAverage * daysPassed;
  const monthlyLimit = 1000000;
  const costPerMillion = 2.5;

  return NextResponse.json({
    provider: "openai",
    quota: {
      window: "Month",
      limit: monthlyLimit,
      used: Math.floor(usedTokens),
      remaining: Math.floor(monthlyLimit - usedTokens),
      resetAt: new Date(startOfMonth + 86400000 * (daysInMonth + 1)).toISOString(),
    },
    usage: {
      today: Math.floor(dailyAverage),
      last7days: Math.floor(dailyAverage * 7),
      last30days: Math.floor(dailyAverage * 30),
      currentMonth: Math.floor(usedTokens),
    },
    cost: {
      today: parseFloat((dailyAverage / 1000000 * costPerMillion).toFixed(4)),
      last7days: parseFloat((dailyAverage * 7 / 1000000 * costPerMillion).toFixed(4)),
      last30days: parseFloat((dailyAverage * 30 / 1000000 * costPerMillion).toFixed(4)),
      currentMonth: parseFloat((usedTokens / 1000000 * costPerMillion).toFixed(4)),
      currency: "USD",
    },
    attribution: [
      {
        taskId: "task-1",
        agentId: "agent-main",
        projectId: "proj-auth",
        tokens: Math.floor(usedTokens * 0.4),
        cost: parseFloat((usedTokens * 0.4 / 1000000 * costPerMillion).toFixed(4)),
        percentage: 40,
      },
      {
        taskId: "task-2",
        agentId: "agent-docs",
        projectId: "proj-docs",
        tokens: Math.floor(usedTokens * 0.25),
        cost: parseFloat((usedTokens * 0.25 / 1000000 * costPerMillion).toFixed(4)),
        percentage: 25,
      },
      {
        taskId: "task-3",
        agentId: "agent-helper",
        projectId: "proj-bugfix",
        tokens: Math.floor(usedTokens * 0.2),
        cost: parseFloat((usedTokens * 0.2 / 1000000 * costPerMillion).toFixed(4)),
        percentage: 20,
      },
      {
        agentId: "agent-main",
        tokens: Math.floor(usedTokens * 0.55),
        cost: parseFloat((usedTokens * 0.55 / 1000000 * costPerMillion).toFixed(4)),
        percentage: 55,
      },
      {
        agentId: "agent-helper",
        tokens: Math.floor(usedTokens * 0.3),
        cost: parseFloat((usedTokens * 0.3 / 1000000 * costPerMillion).toFixed(4)),
        percentage: 30,
      },
    ],
    trends: {
      daily: [
        { date: new Date(now - 86400000 * 6).toISOString().split('T')[0], tokens: 42000, cost: 0.105 },
        { date: new Date(now - 86400000 * 5).toISOString().split('T')[0], tokens: 45000, cost: 0.1125 },
        { date: new Date(now - 86400000 * 4).toISOString().split('T')[0], tokens: 38000, cost: 0.095 },
        { date: new Date(now - 86400000 * 3).toISOString().split('T')[0], tokens: 52000, cost: 0.13 },
        { date: new Date(now - 86400000 * 2).toISOString().split('T')[0], tokens: 47000, cost: 0.1175 },
        { date: new Date(now - 86400000 * 1).toISOString().split('T')[0], tokens: 43000, cost: 0.1075 },
        { date: new Date(now).toISOString().split('T')[0], tokens: 45000, cost: 0.1125 },
      ],
    },
  });
}
