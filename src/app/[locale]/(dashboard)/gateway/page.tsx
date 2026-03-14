"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Server,
  Clock,
  Zap,
  TrendingUp,
  RefreshCw,
  Pause,
  Play,
  MessageSquare,
} from "lucide-react";
import { useGatewayHealth, useSessions, useAgents } from "@/lib/openclaw";

export default function GatewayPage() {
  const t = useTranslations('gateway');
  const tCommon = useTranslations('common');
  const {
    data: health,
    loading: healthLoading,
    refetch: refetchHealth,
    lastChecked,
    isAutoRefreshing,
    toggleAutoRefresh,
  } = useGatewayHealth({ interval: 30000 });
  const { data: sessions, loading: sessionsLoading } = useSessions();
  const { data: agents, loading: agentsLoading } = useAgents();

  const handleRefresh = () => {
    refetchHealth();
  };

  const formatLastChecked = (date: Date | null) => {
    if (!date) return '-';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ${diffSecs % 60}s ago`;
    return date.toLocaleTimeString();
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRefresh}
            className={isAutoRefreshing ? "" : "bg-yellow-50 dark:bg-yellow-900/20"}
          >
            {isAutoRefreshing ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isAutoRefreshing ? t('pause') : t('resume')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={healthLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${healthLoading ? 'animate-spin' : ''}`} />
            {healthLoading ? t('refreshing') : tCommon('refresh')}
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle>{t('connectionStatus')}</CardTitle>
              {isAutoRefreshing && (
                <Badge variant="outline" className="text-xs">
                  {t('autoRefreshEnabled')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{t('lastChecked')}: {formatLastChecked(lastChecked)}</span>
              </div>
              <Badge variant={health?.status === "healthy" ? "default" : "destructive"} className={health?.status === "healthy" ? "bg-green-500 hover:bg-green-600" : ""}>
                {health?.status === "healthy" ? t('connected') : t('disconnected')}
              </Badge>
            </div>
          </div>
          <CardDescription>
            {health?.status === "healthy"
              ? t('gatewayConnectedOperational')
              : t('unableToConnect')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {health ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Server className="h-4 w-4" />
                    <span>{t('version')}</span>
                  </div>
                  <p className="text-lg font-semibold">{health.version}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{t('uptime')}</span>
                  </div>
                  <p className="text-lg font-semibold">{formatUptime(health.uptime)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>{t('platform')}</span>
                  </div>
                  <p className="text-lg font-semibold">{health.os}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>{t('nodeVersion')}</span>
                  </div>
                  <p className="text-lg font-semibold">{health.nodeVersion}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>{t('activeSessions')}</span>
                  </div>
                  <p className="text-lg font-semibold">{health.sessions}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Server className="h-4 w-4" />
                    <span>{t('configuredAgents')}</span>
                  </div>
                  <p className="text-lg font-semibold">{health.agents}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {healthLoading ? t('loading') : t('unableToConnectToGateway')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channel Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t('channelStatus')}</CardTitle>
          <CardDescription>{t('connectedCommunicationChannels')}</CardDescription>
        </CardHeader>
        <CardContent>
          {health?.channels && health.channels.length > 0 ? (
            <div className="space-y-2">
              {health.channels.map((channel: { name: string; enabled: boolean; status: string }) => (
                <div key={channel.name} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        channel.status === "connected" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="font-medium">{channel.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={channel.enabled ? "default" : "secondary"} className={channel.enabled ? "bg-green-500 hover:bg-green-600" : ""}>
                      {channel.enabled ? t('enabled') : t('disabled')}
                    </Badge>
                    <Badge variant={channel.status === "connected" ? "default" : "destructive"} className={channel.status === "connected" ? "bg-green-500 hover:bg-green-600" : ""}>
                      {channel.status === "connected" ? "connected" : "disconnected"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('activeSessions')}</CardTitle>
          <CardDescription>{t('currentlyActiveAgentSessions')}</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm">{session.id.substring(0, 8)}...</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {session.chatType || 'unknown'}
                        </span>
                        {' • '}
                        <span>{session.lastChannel || session.origin || 'webchat'}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.updatedAt ? `Updated: ${new Date(session.updatedAt).toLocaleString()}` : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {session.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t('noActiveSessions')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('agentInformation')}</CardTitle>
          <CardDescription>{t('configuredAIAgents')}</CardDescription>
        </CardHeader>
        <CardContent>
          {agentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : agents && agents.length > 0 ? (
            <div className="space-y-3">
              {agents.map((agent) => (
                <div key={agent.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{t('model')}: {agent.model}</p>
                      {agent.modelId && (
                        <p className="text-xs text-muted-foreground">ID: {agent.modelId}</p>
                      )}
                      {agent.contextWindow && (
                        <p className="text-xs text-muted-foreground">Context: {agent.contextWindow.toLocaleString()} tokens</p>
                      )}
                      {agent.totalSessions !== undefined && (
                        <p className="text-xs text-muted-foreground">Sessions: {agent.totalSessions}</p>
                      )}
                    </div>
                    <Badge variant={agent.status === "active" ? "default" : "secondary"} className={agent.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}>
                      {agent.status}
                    </Badge>
                  </div>
                  {agent.activeSession && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Active Session:</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          {agent.activeSession.lastChannel || 'webchat'}
                        </Badge>
                        <span className="text-muted-foreground">
                          {agent.activeSession.updatedAt ? new Date(agent.activeSession.updatedAt).toLocaleString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t('noAgentsConfigured')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
