"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  MessageSquare,
  Bot,
  Radio,
  TrendingUp,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  RefreshCw,
  Filter,
  ArrowRight,
  Bell,
  ShieldAlert,
  PauseCircle,
  PlayCircle,
  MoreHorizontal,
  Settings,
  Smartphone,
  Send,
} from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import Link from "next/link";
import { useGatewayHealth, useAgents, useSessions, useChannels, useRuntimeData } from "@/lib/openclaw";

// Types for overview data
interface PendingItem {
  id: string;
  type: "approval" | "exception" | "alert";
  title: string;
  description?: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  source?: string;
}

interface RiskItem {
  id: string;
  type: "budget" | "stalled" | "system";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  affected?: string[];
}

interface StaffStatus {
  working: number;
  standby: number;
  offline: number;
  total: number;
}

export default function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isZh = locale === 'zh';
  const [searchQuery, setSearchQuery] = useState("");

  // Use real API hooks
  const { data: healthData, loading: healthLoading, refetch: refetchHealth } = useGatewayHealth();
  const { data: agents, loading: agentsLoading, refetch: refetchAgents } = useAgents();
  const { data: sessions, loading: sessionsLoading, refetch: refetchSessions } = useSessions();
  const { data: channels, loading: channelsLoading, refetch: refetchChannels } = useChannels();
  const { data: runtimeData, loading: runtimeLoading, refetch: refetchRuntime } = useRuntimeData();

  // Computed values from API data
  const loading = healthLoading || agentsLoading || sessionsLoading || channelsLoading || runtimeLoading;

  const systemHealth = useMemo(() => {
    const totalChannels = channels?.length || 0;

    if (!healthData) {
      return {
        gatewayStatus: "healthy" as "healthy" | "degraded" | "unhealthy",
        uptime: "0m",
        activeSessions: 0,
        totalAgents: 0,
        connectedChannels: 0,
        totalChannels,
        tokenUsage: { used: 0, limit: 1000000, percentage: 0 },
        recentErrors: 0,
        warnings: 0,
      };
    }
    const uptimeSeconds = healthData.uptime || 0;
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return {
      gatewayStatus: healthData.status || "healthy",
      uptime,
      activeSessions: healthData.sessions || sessions?.length || 0,
      totalAgents: healthData.agents || agents?.length || 0,
      connectedChannels: channels?.filter((c: any) => c.status === "connected").length || 0,
      totalChannels,
      tokenUsage: { used: 0, limit: 1000000, percentage: 0 }, // Will be updated from runtime data
      recentErrors: 0,
      warnings: 0,
    };
  }, [healthData, agents, sessions, channels]);

  const pendingItems = runtimeData?.pendingItems || [];
  const risks = runtimeData?.risks || [];

  const staffStatus = useMemo(() => {
    const activeAgents = agents?.filter((a: any) => a.status === "active") || [];
    return {
      working: activeAgents.filter((a: any) => (a as any).currentTask !== undefined).length,
      standby: activeAgents.length - (activeAgents.filter((a: any) => (a as any).currentTask !== undefined).length),
      offline: (agents?.length || 0) - activeAgents.length,
      total: agents?.length || 0,
    };
  }, [agents]);

  // Refetch all data
  const handleRefresh = () => {
    refetchHealth();
    refetchAgents();
    refetchSessions();
    refetchChannels();
    refetchRuntime();
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">{t('severity.critical')}</Badge>;
      case "high":
        return <Badge variant="destructive" className="bg-orange-500">{t('severity.high')}</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">{t('severity.medium')}</Badge>;
      case "low":
        return <Badge variant="secondary">{t('severity.low')}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "approval":
        return <CheckCircle2 className="h-4 w-4" />;
      case "exception":
        return <XCircle className="h-4 w-4" />;
      case "alert":
        return <Bell className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case "budget":
        return <TrendingUp className="h-4 w-4" />;
      case "stalled":
        return <PauseCircle className="h-4 w-4" />;
      case "system":
        return <ShieldAlert className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('overview.title')}</h2>
          <p className="text-muted-foreground">
            {t('overview.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('overview.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('overview.refresh')}
          </Button>
        </div>
      </div>

      {/* Skeleton Loading State */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Key Status Indicators */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.metrics.gateway')}</CardTitle>
            <Activity className={`h-4 w-4 ${
              systemHealth.gatewayStatus === "healthy" ? "text-green-500" :
              systemHealth.gatewayStatus === "degraded" ? "text-yellow-500" :
              "text-red-500"
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold capitalize ${
              systemHealth.gatewayStatus === "healthy" ? "text-green-500" :
              systemHealth.gatewayStatus === "degraded" ? "text-yellow-500" :
              "text-red-500"
            }`}>{systemHealth.gatewayStatus}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('overview.metrics.uptime')}: {systemHealth.uptime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.metrics.sessions')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('overview.metrics.activeNow')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.metrics.agents')}</CardTitle>
            <Bot className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.totalAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {staffStatus.working} {t('overview.metrics.working')}, {staffStatus.standby} {t('overview.metrics.standby')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.metrics.channels')}</CardTitle>
            <Radio className={`h-4 w-4 ${
              systemHealth.totalChannels === 0 ? "text-gray-500" :
              systemHealth.connectedChannels === systemHealth.totalChannels ? "text-green-500" :
              systemHealth.connectedChannels > 0 ? "text-yellow-500" :
              "text-red-500"
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              systemHealth.totalChannels === 0 ? "text-gray-500" :
              systemHealth.connectedChannels === systemHealth.totalChannels ? "text-green-500" :
              systemHealth.connectedChannels > 0 ? "text-yellow-500" :
              "text-red-500"
            }`}>{systemHealth.connectedChannels}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('overview.metrics.connected')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.metrics.tokenUsage')}</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.tokenUsage.percentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemHealth.tokenUsage.used.toLocaleString()} / {systemHealth.tokenUsage.limit.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.metrics.issues')}</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${
              systemHealth.warnings > 0 || systemHealth.recentErrors > 0 ? "text-orange-500" : "text-gray-500"
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth.recentErrors + systemHealth.warnings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemHealth.recentErrors} {t('overview.metrics.errors')}, {systemHealth.warnings} {t('overview.metrics.warnings')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pending Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('overview.pendingItems.title')}</CardTitle>
                <CardDescription>
                  {loading ? t('common.loading') : t('overview.pendingItems.description', { count: pendingItems.length })}
                </CardDescription>
              </div>
              <Link href={`/${locale}/approvals`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                {t('common.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pendingItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground">{t('overview.pendingItems.noItems')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-0.5">{getTypeIcon(item.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{item.title}</span>
                        {getSeverityBadge(item.severity)}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(item.timestamp)}</span>
                        {item.source && (
                          <>
                            <span>•</span>
                            <span>{item.source}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risks */}
        <Card>
          <CardHeader>
            <CardTitle>{t('overview.risks.title')}</CardTitle>
            <CardDescription>
              {loading ? t('common.loading') : t('overview.risks.description', { count: risks.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : risks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShieldAlert className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground">{t('overview.risks.noRisks')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {risks.map((risk: any) => (
                  <div
                    key={risk.id}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      {getRiskTypeIcon(risk.type)}
                      <span className="font-medium text-sm">{risk.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{risk.description}</p>
                    <div className="flex items-center justify-between">
                      {getSeverityBadge(risk.severity)}
                      {risk.affected && risk.affected.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {t('overview.risks.affected', { count: risk.affected.length })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staff Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('overview.staffStatus.title')}</CardTitle>
              <CardDescription>
                {loading ? t('common.loading') : t('overview.staffStatus.description', { working: staffStatus.working, standby: staffStatus.standby })}
              </CardDescription>
            </div>
            <Link href={`/${locale}/staff`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
              {t('common.viewDetails')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Working */}
              <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <PlayCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{staffStatus.working}</div>
                  <p className="text-xs text-muted-foreground">{t('overview.staffStatus.working')}</p>
                </div>
              </div>

              {/* Standby */}
              <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Users className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{staffStatus.standby}</div>
                  <p className="text-xs text-muted-foreground">{t('overview.staffStatus.standby')}</p>
                </div>
              </div>

              {/* Offline */}
              <div className="flex items-center gap-3 rounded-lg border border-gray-500/20 bg-gray-500/5 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10">
                  <PauseCircle className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{staffStatus.offline}</div>
                  <p className="text-xs text-muted-foreground">{t('overview.staffStatus.offline')}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Channels */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('overview.channels.title', { defaultValue: 'Connected Channels' })}</CardTitle>
              <CardDescription>
                {loading ? t('common.loading') : `${systemHealth.connectedChannels}/${systemHealth.totalChannels} ${t('overview.channels.connected', { defaultValue: 'connected' })}`}
              </CardDescription>
            </div>
            <Link href={`/${locale}/channels`} className="text-sm text-muted-foreground hover:text-primary">
              {t('common.viewAll')}
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : channels && channels.length > 0 ? (
            <div className="space-y-3">
              {channels.map((channel: any) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {channel.type === 'imessage' ? (
                      <Smartphone className={`h-5 w-5 ${
                        channel.status === 'connected' ? 'text-green-500' : 'text-red-500'
                      }`} />
                    ) : channel.type === 'feishu' ? (
                      <MessageSquare className={`h-5 w-5 ${
                        channel.status === 'connected' ? 'text-green-500' : 'text-red-500'
                      }`} />
                    ) : channel.type === 'telegram' ? (
                      <Send className={`h-5 w-5 ${
                        channel.status === 'connected' ? 'text-green-500' : 'text-red-500'
                      }`} />
                    ) : (
                      <Radio className={`h-5 w-5 ${
                        channel.status === 'connected' ? 'text-green-500' : 'text-red-500'
                      }`} />
                    )}
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{channel.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {channel.status === 'connected' ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        {t('common.connected', { defaultValue: 'Connected' })}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                        {t('common.disconnected', { defaultValue: 'Disconnected' })}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Radio className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('overview.channels.noChannels', { defaultValue: 'No channels configured' })}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('overview.quickActions.title')}</CardTitle>
          <CardDescription>{t('overview.quickActions.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Link href={`/${locale}/sessions`} className="inline-flex items-center justify-start rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              <MessageSquare className="mr-2 h-4 w-4" />
              {t('overview.quickActions.viewSessions')}
            </Link>
            <Link href={`/${locale}/agents`} className="inline-flex items-center justify-start rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              <Bot className="mr-2 h-4 w-4" />
              {t('overview.quickActions.manageAgents')}
            </Link>
            <Link href={`/${locale}/channels`} className="inline-flex items-center justify-start rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              <Radio className="mr-2 h-4 w-4" />
              {t('overview.quickActions.checkChannels')}
            </Link>
            <Link href={`/${locale}/settings`} className="inline-flex items-center justify-start rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              <Settings className="mr-2 h-4 w-4" />
              {t('overview.quickActions.openSettings')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
