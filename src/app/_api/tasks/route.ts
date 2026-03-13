import { NextResponse } from 'next/server';

const TASKS = [
  {
    id: "task-1",
    title: "Review PR #234 for authentication module",
    titleZh: "审查认证模块的 PR #234",
    description: "Review the authentication changes and test the flow",
    descriptionZh: "审查认证更改并测试流程",
    status: "in-progress",
    priority: "high",
    projectId: "proj-auth",
    projectTitle: "Authentication System",
    projectTitleZh: "认证系统",
    assignedTo: "agent-main",
    assigneeName: "Main Assistant",
    assigneeNameZh: "主助手",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    tags: ["code-review", "security"],
    subtaskCount: 5,
    completedSubtasks: 3,
  },
  {
    id: "task-2",
    title: "Generate API documentation",
    titleZh: "生成 API 文档",
    description: "Create comprehensive API docs for the new endpoints",
    descriptionZh: "为新端点创建全面的 API 文档",
    status: "pending",
    priority: "medium",
    projectId: "proj-docs",
    projectTitle: "Documentation",
    projectTitleZh: "文档",
    assignedTo: "agent-docs",
    assigneeName: "Documentation Agent",
    assigneeNameZh: "文档代理",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    tags: ["documentation"],
    subtaskCount: 8,
    completedSubtasks: 0,
  },
  {
    id: "task-3",
    title: "Investigate memory leak in session manager",
    titleZh: "调查会话管理器中的内存泄漏",
    description: "Debug and fix the memory leak issue",
    descriptionZh: "调试并修复内存泄漏问题",
    status: "blocked",
    priority: "critical",
    projectId: "proj-bugfix",
    projectTitle: "Bug Fixes",
    projectTitleZh: "Bug 修复",
    assignedTo: "agent-helper",
    assigneeName: "Helper Bot",
    assigneeNameZh: "助手机器人",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    tags: ["bug", "urgent"],
    subtaskCount: 3,
    completedSubtasks: 1,
  },
  {
    id: "task-4",
    title: "Update user guide for new features",
    titleZh: "更新新功能的用户指南",
    description: "Add documentation for recently released features",
    descriptionZh: "为最近发布的功能添加文档",
    status: "completed",
    priority: "low",
    projectId: "proj-docs",
    projectTitle: "Documentation",
    projectTitleZh: "文档",
    assignedTo: "agent-docs",
    assigneeName: "Documentation Agent",
    assigneeNameZh: "文档代理",
    dueDate: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    tags: ["documentation"],
    subtaskCount: 6,
    completedSubtasks: 6,
  },
  {
    id: "task-5",
    title: "Optimize database query performance",
    titleZh: "优化数据库查询性能",
    description: "Improve query efficiency for large datasets",
    descriptionZh: "提高大数据集的查询效率",
    status: "pending",
    priority: "high",
    projectId: "proj-performance",
    projectTitle: "Performance",
    projectTitleZh: "性能",
    assignedTo: "agent-main",
    assigneeName: "Main Assistant",
    assigneeNameZh: "主助手",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    tags: ["performance", "database"],
    subtaskCount: 4,
    completedSubtasks: 0,
  },
  {
    id: "task-6",
    title: "Security audit for authentication flow",
    titleZh: "认证流程的安全审计",
    description: "Review and enhance security measures",
    descriptionZh: "审查并增强安全措施",
    status: "in-progress",
    priority: "critical",
    projectId: "proj-security",
    projectTitle: "Security",
    projectTitleZh: "安全",
    assignedTo: "agent-security",
    assigneeName: "Security Agent",
    assigneeNameZh: "安全代理",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    tags: ["security", "audit"],
    subtaskCount: 10,
    completedSubtasks: 6,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  let filteredTasks = [...TASKS];

  if (status) {
    filteredTasks = filteredTasks.filter(t => t.status === status);
  }

  if (priority) {
    filteredTasks = filteredTasks.filter(t => t.priority === priority);
  }

  const paginatedTasks = filteredTasks.slice(offset, offset + limit);

  return NextResponse.json(paginatedTasks);
}
