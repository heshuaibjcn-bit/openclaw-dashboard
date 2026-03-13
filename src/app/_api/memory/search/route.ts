import { NextResponse } from 'next/server';

// This would use actual vector search in production
// For now, we'll do simple text matching

const MEMORY_ENTRIES = [
  {
    id: "mem-1",
    content: "User prefers dark mode interface settings across all applications",
    contentZh: "用户在所有应用程序中偏好深色模式界面设置",
    metadata: { type: "preference", importance: "high", agent: "main" },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    embedding: null,
  },
  {
    id: "mem-2",
    content: "Project uses Next.js 16 with App Router and TypeScript for the dashboard",
    contentZh: "项目使用 Next.js 16 和 App Router 以及 TypeScript 构建仪表板",
    metadata: { type: "project", importance: "high", agent: "main" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    embedding: null,
  },
  {
    id: "mem-3",
    content: "Main Assistant specializes in code review, documentation, and analysis tasks",
    contentZh: "主助手专长于代码审查、文档编写和分析任务",
    metadata: { type: "agent", importance: "medium", agent: "main" },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    embedding: null,
  },
  {
    id: "mem-4",
    content: "Helper Bot specializes in debugging, testing, and support tasks",
    contentZh: "助手机器人专长于调试、测试和支持任务",
    metadata: { type: "agent", importance: "medium", agent: "helper" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    embedding: null,
  },
  {
    id: "mem-5",
    content: "API authentication uses Bearer token stored in localStorage",
    contentZh: "API 身份验证使用存储在 localStorage 中的 Bearer 令牌",
    metadata: { type: "configuration", importance: "high", agent: "main" },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    embedding: null,
  },
  {
    id: "mem-6",
    content: "Documentation Agent specializes in documentation and writing tasks",
    contentZh: "文档代理专长于文档编写和写作任务",
    metadata: { type: "agent", importance: "medium", agent: "docs" },
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    embedding: null,
  },
  {
    id: "mem-7",
    content: "Memory system uses LanceDB for vector storage and semantic search",
    contentZh: "记忆系统使用 LanceDB 进行向量存储和语义搜索",
    metadata: { type: "configuration", importance: "medium", agent: "main" },
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    embedding: null,
  },
  {
    id: "mem-8",
    content: "WebSocket connection runs on ws://127.0.0.1:18789/gateway",
    contentZh: "WebSocket 连接运行在 ws://127.0.0.1:18789/gateway",
    metadata: { type: "configuration", importance: "medium", agent: "main" },
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    embedding: null,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const limit = parseInt(searchParams.get("limit") || "10");

  if (!query) {
    return NextResponse.json(MEMORY_ENTRIES.slice(0, limit));
  }

  // Simple text matching search (would use vector similarity in production)
  const queryLower = query.toLowerCase();
  const results = MEMORY_ENTRIES
    .map(entry => {
      const contentLower = entry.content.toLowerCase();
      const contentZhLower = entry.contentZh.toLowerCase();
      const enScore = calculateRelevance(queryLower, contentLower);
      const zhScore = calculateRelevance(queryLower, contentZhLower);
      const score = Math.max(enScore, zhScore);

      return {
        ...entry,
        score,
      };
    })
    .filter(entry => entry.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json(results);
}

function calculateRelevance(query: string, text: string): number {
  if (!text) return 0;

  const queryWords = query.split(/\s+/).filter(w => w.length > 2);
  const textWords = text.split(/\s+/);

  let matches = 0;
  for (const queryWord of queryWords) {
    for (const textWord of textWords) {
      if (textWord.toLowerCase().includes(queryWord) ||
          queryWord.includes(textWord.toLowerCase())) {
        matches++;
        break;
      }
    }
  }

  return matches / Math.max(queryWords.length, 1);
}
