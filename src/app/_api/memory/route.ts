import { NextResponse } from 'next/server';

const MEMORY_ENTRIES = [
  {
    id: "mem-1",
    content: "User prefers dark mode interface settings across all applications",
    contentZh: "用户在所有应用程序中偏好深色模式界面设置",
    metadata: { type: "preference", importance: "high", agent: "main" },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    score: 0.95,
  },
  {
    id: "mem-2",
    content: "Project uses Next.js 16 with App Router and TypeScript for the dashboard",
    contentZh: "项目使用 Next.js 16 和 App Router 以及 TypeScript 构建仪表板",
    metadata: { type: "project", importance: "high", agent: "main" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    score: 0.89,
  },
  {
    id: "mem-3",
    content: "Main Assistant specializes in code review, documentation, and analysis tasks",
    contentZh: "主助手专长于代码审查、文档编写和分析任务",
    metadata: { type: "agent", importance: "medium", agent: "main" },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    score: 0.92,
  },
  {
    id: "mem-4",
    content: "Recent activity: Main Agent processed 15 tasks with 98% success rate",
    contentZh: "最近活动：主代理处理了 15 个任务，成功率为 98%",
    metadata: { type: "performance", importance: "low", agent: "main" },
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    score: 0.78,
  },
  {
    id: "mem-5",
    content: "API authentication uses Bearer token stored in localStorage",
    contentZh: "API 身份验证使用存储在 localStorage 中的 Bearer 令牌",
    metadata: { type: "configuration", importance: "high", agent: "main" },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    score: 0.85,
  },
  {
    id: "mem-6",
    content: "Helper Bot specializes in debugging, testing, and support tasks",
    contentZh: "助手机器人专长于调试、测试和支持任务",
    metadata: { type: "agent", importance: "medium", agent: "helper" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    score: 0.88,
  },
  {
    id: "mem-7",
    content: "Documentation Agent specializes in documentation and writing tasks",
    contentZh: "文档代理专长于文档编写和写作任务",
    metadata: { type: "agent", importance: "medium", agent: "docs" },
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    score: 0.82,
  },
  {
    id: "mem-8",
    content: "Memory system uses LanceDB for vector storage and semantic search",
    contentZh: "记忆系统使用 LanceDB 进行向量存储和语义搜索",
    metadata: { type: "configuration", importance: "medium", agent: "main" },
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    score: 0.76,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");

  return NextResponse.json(MEMORY_ENTRIES.slice(offset, offset + limit));
}
