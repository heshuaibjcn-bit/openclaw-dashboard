"use client";

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
} from "lucide-react";
import { useGatewayHealth, useSessions, useAgents } from "@/lib/openclaw";

export default function GatewayPage() {
  const { data: health, loading: healthLoading, refetch: refetchHealth } = useGatewayHealth();
  const { data: sessions, loading: sessionsLoading } = useSessions();
  const { data: agents, loading: agentsLoading } = useAgents();

  const handleRefresh = () => {
    refetchHealth();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gateway Status</h2>
          <p className="text-muted-foreground">
            Monitor your OpenClaw Gateway connection and performance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle>Connection Status</CardTitle>
            </div>
            <Badge variant={health?.status === "healthy" ? "default" : "destructive"}>
              {health?.status === "healthy" ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <CardDescription>
            {health?.status === "healthy"
              ? "Your gateway is connected and operational"
              : "Unable to connect to OpenClaw Gateway"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {health ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Server className="h-4 w-4" />
                    <span>Version</span>
                  </div>
                  <p className="text-lg font-semibold">{health.version}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Uptime</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>Platform</span>
                  </div>
                  <p className="text-lg font-semibold">{health.os}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>Node Version</span>
                  </div>
                  <p className="text-lg font-semibold">{health.nodeVersion}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Active Sessions</span>
                  </div>
                  <p className="text-lg font-semibold">{health.sessions}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Server className="h-4 w-4" />
                    <span>Configured Agents</span>
                  </div>
                  <p className="text-lg font-semibold">{health.agents}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {healthLoading ? "Loading gateway status..." : "Unable to connect to gateway"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channel Status */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Status</CardTitle>
          <CardDescription>Connected communication channels</CardDescription>
        </CardHeader>
        <CardContent>
          {health?.channels ? (
            <div className="space-y-2">
              {health.channels.map((channel: { name: string; enabled: boolean; status: string }) => (
                <div key={channel.name} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        channel.status === "OK" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="font-medium">{channel.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={channel.enabled ? "default" : "secondary"}>
                      {channel.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Badge variant={channel.status === "OK" ? "default" : "destructive"}>
                      {channel.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading channels...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Currently active agent sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading sessions...</p>
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{session.id}</p>
                      <p className="text-sm text-muted-foreground">Model: {session.model}</p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(session.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {session.tokens.total.toLocaleString()} / {session.tokens.max.toLocaleString()} tokens
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((session.tokens.total / session.tokens.max) * 100)}% used
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No active sessions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Information */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
          <CardDescription>Configured AI agents</CardDescription>
        </CardHeader>
        <CardContent>
          {agentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading agents...</p>
            </div>
          ) : agents && agents.length > 0 ? (
            <div className="space-y-3">
              {agents.map((agent) => (
                <div key={agent.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">Model: {agent.model}</p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(agent.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.capabilities.map((cap: string) => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No agents configured</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
