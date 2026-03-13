import { NextResponse } from 'next/server';

// Generate usage data based on time range
function generateUsageData(timeRange: string) {
  const now = Date.now();
  const multipliers = {
    "today": 1,
    "7days": 7,
    "30days": 30,
  };
  const multiplier = multipliers[timeRange as keyof typeof multipliers] || 7;

  // Base daily usage
  const dailyTokens = 40000 + Math.random() * 10000;
  const dailyCost = dailyTokens * 0.00001;

  return {
    timeRange,
    today: {
      tokens: Math.floor(dailyTokens),
      cost: parseFloat((dailyCost).toFixed(4)),
    },
    last7days: {
      tokens: Math.floor(dailyTokens * 7),
      cost: parseFloat((dailyCost * 7).toFixed(4)),
    },
    last30days: {
      tokens: Math.floor(dailyTokens * 30),
      cost: parseFloat((dailyCost * 30).toFixed(4)),
    },
    quota: {
      limit: 1000000,
      used: Math.floor(dailyTokens * multiplier * 0.7), // 70% usage
      remaining: Math.floor(1000000 - dailyTokens * multiplier * 0.7),
      window: timeRange === "today" ? "Day" : timeRange === "7days" ? "Week" : "Month",
      resetAt: new Date(now + 86400000 * (timeRange === "today" ? 1 : 7)).toISOString(),
    },
    attribution: [
      {
        id: "agent-main",
        name: "Main Assistant",
        nameZh: "主助手",
        type: "agent",
        tokens: Math.floor(dailyTokens * multiplier * 0.5),
        cost: parseFloat((dailyCost * multiplier * 0.5).toFixed(4)),
        percentage: 50,
      },
      {
        id: "agent-helper",
        name: "Helper Bot",
        nameZh: "助手机器人",
        type: "agent",
        tokens: Math.floor(dailyTokens * multiplier * 0.3),
        cost: parseFloat((dailyCost * multiplier * 0.3).toFixed(4)),
        percentage: 30,
      },
      {
        id: "agent-docs",
        name: "Documentation Agent",
        nameZh: "文档代理",
        type: "agent",
        tokens: Math.floor(dailyTokens * multiplier * 0.2),
        cost: parseFloat((dailyCost * multiplier * 0.2).toFixed(4)),
        percentage: 20,
      },
      {
        id: "task-1",
        name: "Code Review",
        nameZh: "代码审查",
        type: "task",
        tokens: Math.floor(dailyTokens * multiplier * 0.35),
        cost: parseFloat((dailyCost * multiplier * 0.35).toFixed(4)),
        percentage: 35,
      },
      {
        id: "task-2",
        name: "Documentation",
        nameZh: "文档编写",
        type: "task",
        tokens: Math.floor(dailyTokens * multiplier * 0.25),
        cost: parseFloat((dailyCost * multiplier * 0.25).toFixed(4)),
        percentage: 25,
      },
    ],
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get("timeRange") || "7days";

  const data = generateUsageData(timeRange);

  return NextResponse.json(data);
}
