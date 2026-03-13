import { NextResponse } from 'next/server';

const APPROVALS = [
  {
    id: "1",
    type: "write_config",
    category: "config",
    description: "Update openclaw.json configuration",
    descriptionZh: "更新 openclaw.json 配置",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 55).toISOString(),
    requestedBy: "system",
    riskLevel: "high",
    details: {
      file: "openclaw.json",
      changes: ["Add new agent", "Update model settings"],
    },
  },
  {
    id: "2",
    type: "import_data",
    category: "import",
    description: "Import runtime data snapshot",
    descriptionZh: "导入运行时数据快照",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 50).toISOString(),
    requestedBy: "admin",
    riskLevel: "medium",
    details: {
      source: "/tmp/snapshot.json",
      size: "2.3MB",
    },
  },
  {
    id: "3",
    type: "enable_channel",
    category: "channel",
    description: "Enable Feishu channel integration",
    descriptionZh: "启用飞书渠道集成",
    status: "approved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    requestedBy: "user",
    riskLevel: "low",
    details: {
      channel: "feishu",
    },
  },
  {
    id: "4",
    type: "update_agent",
    category: "agent",
    description: "Update agent system prompt",
    descriptionZh: "更新代理系统提示词",
    status: "rejected",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    requestedBy: "user",
    riskLevel: "medium",
    details: {
      agent: "research",
      reason: "Prompt too verbose",
    },
  },
  {
    id: "5",
    type: "export_memory",
    category: "export",
    description: "Export all memory entries",
    descriptionZh: "导出所有记忆条目",
    status: "expired",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    requestedBy: "system",
    riskLevel: "critical",
    details: {
      format: "json",
      destination: "/tmp/memory-export.json",
    },
  },
  {
    id: "6",
    type: "change_model",
    category: "agent",
    description: "Change agent model configuration",
    descriptionZh: "更改代理模型配置",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
    requestedBy: "admin",
    riskLevel: "high",
    details: {
      agent: "agent-main",
      fromModel: "zai/glm-5",
      toModel: "zai/glm-5-pro",
    },
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "20");

  let filtered = [...APPROVALS];

  if (status && status !== "all") {
    filtered = filtered.filter(a => a.status === status);
  }

  return NextResponse.json(filtered.slice(0, limit));
}
