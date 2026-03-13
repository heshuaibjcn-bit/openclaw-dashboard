"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Bot,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  MoreVertical,
  MessageSquare,
  Zap,
  Calendar,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useAgents, useRuntimeData } from "@/lib/openclaw";

interface StaffMember {
  id: string;
  name: string;
  model: string;
  status: "working" | "standby" | "offline" | "error";
  currentTask?: {
    id: string;
    title: string;
    progress: number;
    startedAt: Date;
  };
  nextTask?: {
    id: string;
    title: string;
    scheduledAt: Date;
  };
  recentOutput: {
    count: number;
    lastActivity: Date;
  };
  capabilities: string[];
  uptime: number;
}

export default function StaffPage() {
  const t = useTranslations('staff');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isZh = locale === 'zh';

  // Use real API hooks
  const { data: agents, loading: agentsLoading, refetch: refetchAgents } = useAgents();
  const { data: runtimeData, loading: runtimeLoading, refetch: refetchRuntime } = useRuntimeData();

  const loading = agentsLoading || runtimeLoading;

  // Transform agents data to staff members format
  const staff = useMemo(() => {
    if (!agents || agents.length === 0) {
      // Fallback to mock data
      return [
        {
          id: "agent-main",
          name: isZh ? "主助手" : "Main Assistant",
          model: "zai/glm-5",
          status: "working" as const,
          currentTask: {
            id: "task-1",
            title: isZh ? "正在处理代码审查请求" : "Processing code review requests",
            progress: 65,
            startedAt: new Date(Date.now() - 1000 * 60 * 15),
          },
          nextTask: {
            id: "task-2",
            title: isZh ? "生成文档" : "Generate documentation",
            scheduledAt: new Date(Date.now() + 1000 * 60 * 30),
          },
          recentOutput: {
            count: 23,
            lastActivity: new Date(Date.now() - 1000 * 30),
          },
          capabilities: ["code-review", "documentation", "analysis"],
          uptime: 1000 * 60 * 60 * 4.5,
        },
        {
          id: "agent-helper",
          name: isZh ? "助手机器人" : "Helper Bot",
          model: "zai/glm-4.7",
          status: "standby" as const,
          nextTask: {
            id: "task-3",
            title: isZh ? "Bug 调查" : "Bug investigation",
            scheduledAt: new Date(Date.now() + 1000 * 60 * 10),
          },
          recentOutput: {
            count: 15,
            lastActivity: new Date(Date.now() - 1000 * 60 * 45),
          },
          capabilities: ["debug", "testing", "support"],
          uptime: 1000 * 60 * 60 * 2,
        },
        {
          id: "agent-docs",
          name: isZh ? "文档代理" : "Documentation Agent",
          model: "zai/glm-4.7-flash",
          status: "offline" as const,
          recentOutput: {
            count: 8,
            lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
          },
          capabilities: ["documentation", "writing"],
          uptime: 0,
        },
      ];
    }

    // Get runtime status for each agent
    const agentStatuses = runtimeData?.agentStatuses || {};

    return agents.map((agent: any) => {
      const runtimeStatus = agentStatuses[agent.id] || {};
      return {
        id: agent.id,
        name: agent.name,
        model: agent.model,
        status: runtimeStatus.status || (agent.status === "active" ? "standby" : "offline"),
        currentTask: runtimeStatus.currentTask,
        nextTask: runtimeStatus.nextTask,
        recentOutput: runtimeStatus.recentOutput || {
          count: 0,
          lastActivity: new Date(agent.createdAt || Date.now()),
        },
        capabilities: agent.capabilities || [],
        uptime: runtimeStatus.uptime || 0,
      };
    });
  }, [agents, runtimeData, isZh]);

  const handleRefresh = () => {
    refetchAgents();
    refetchRuntime();
  };

  // Translate capability codes to display names
  const getCapabilityName = (cap: string): string => {
    const capabilityMap: Record<string, { en: string; zh: string }> = {
      "code-review": { en: "Code Review", zh: "代码审查" },
      "documentation": { en: "Documentation", zh: "文档编写" },
      "analysis": { en: "Analysis", zh: "分析" },
      "debug": { en: "Debug", zh: "调试" },
      "testing": { en: "Testing", zh: "测试" },
      "support": { en: "Support", zh: "支持" },
      "writing": { en: "Writing", zh: "写作" },
    };
    return capabilityMap[cap]?.[locale] || cap;
  };

  const getStatusBadge = (status: StaffMember["status"]) => {
    switch (status) {
      case "working":
        return <Badge variant="default" className="bg-green-500">{t('working')}</Badge>;
      case "standby":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">{t('standby')}</Badge>;
      case "offline":
        return <Badge variant="secondary">{t('offline')}</Badge>;
      case "error":
        return <Badge variant="destructive">{t('error')}</Badge>;
    }
  };

  const getStatusIcon = (status: StaffMember["status"]) => {
    switch (status) {
      case "working":
        return <Play className="h-4 w-4 text-green-500" />;
      case "standby":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "offline":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatLastActivity = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const stats = {
    total: staff.length,
    working: staff.filter(s => s.status === "working").length,
    standby: staff.filter(s => s.status === "standby").length,
    offline: staff.filter(s => s.status === "offline").length,
    totalOutput: staff.reduce((sum, s) => sum + s.recentOutput.count, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {tCommon('refresh')}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalAgents')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('configuredAgents')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('working')}</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.working}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('activelyProcessing')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('standby')}</CardTitle>
            <Pause className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.standby}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('awaitingTasks')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('outputToday')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOutput}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('tasksCompleted')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('offline')}</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.offline}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('notActive')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">{t('loadingStaffStatus')}</p>
              </div>
            </CardContent>
          </Card>
        ) : staff.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noAgentsConfigured')}</p>
            </CardContent>
          </Card>
        ) : (
          staff.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-6">
                  {/* Left: Agent Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{member.name}</h3>
                          {getStatusBadge(member.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.model}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Capabilities */}
                    <div className="flex flex-wrap gap-2">
                      {member.capabilities.map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {getCapabilityName(cap)}
                        </Badge>
                      ))}
                    </div>

                    {/* Current/Next Task */}
                    {member.currentTask ? (
                      <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                          <Play className="h-4 w-4" />
                          <span>{t('currentlyProcessing')}</span>
                        </div>
                        <p className="text-sm">{member.currentTask.title}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{tCommon('progress')}</span>
                            <span>{member.currentTask.progress}%</span>
                          </div>
                          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${member.currentTask.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{t('started')} {formatLastActivity(member.currentTask.startedAt)}</span>
                        </div>
                      </div>
                    ) : member.nextTask ? (
                      <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-yellow-600">
                          <Pause className="h-4 w-4" />
                          <span>{t('nextUp')}</span>
                        </div>
                        <p className="text-sm">{member.nextTask.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{t('scheduled')} {formatLastActivity(member.nextTask.scheduledAt)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border bg-muted/50 p-3">
                        <p className="text-sm text-muted-foreground">{t('noTasksScheduled')}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Stats */}
                  <div className="w-48 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('status')}</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(member.status)}
                          <span className="font-medium capitalize">{member.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('uptime')}</span>
                        <span className="font-medium">{formatUptime(member.uptime)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('output')}</span>
                        <span className="font-medium">{member.recentOutput.count} tasks</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('lastActivity')}</span>
                        <span className="font-medium">{formatLastActivity(member.recentOutput.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>{t('statusLegend')}</CardTitle>
          <CardDescription>{t('understandingAgentStatus')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 flex-shrink-0">
                <Play className="h-4 w-4 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{t('working')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('workingDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 flex-shrink-0">
                <Pause className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{t('standby')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('standbyDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-500/10 flex-shrink-0">
                <Clock className="h-4 w-4 text-gray-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{t('offline')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('offlineDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{t('error')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('errorDesc')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
