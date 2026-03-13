"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

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
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [staffStatus, setStaffStatus] = useState<StaffStatus>({
    working: 0,
    standby: 0,
    offline: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // System health metrics
  const [systemHealth, setSystemHealth] = useState({
    gatewayStatus: "healthy" as "healthy" | "degraded" | "unhealthy",
    uptime: "4h 32m",
    activeSessions: 3,
    totalAgents: 4,
    connectedChannels: 2,
    tokenUsage: { used: 45000, limit: 1000000, percentage: 4.5 },
    recentErrors: 2,
    warnings: 5,
  });

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      setLoading(true);
      // TODO: Replace with actual API calls
      setTimeout(() => {
        setPendingItems([
          {
            id: "pending-1",
            type: "approval",
            title: "API key change request",
            description: "Request to update API key for production environment",
            severity: "high",
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            source: "agent-main",
          },
          {
            id: "pending-2",
            type: "exception",
            title: "Session timeout error",
            description: "Agent session exceeded maximum duration",
            severity: "medium",
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            source: "agent-helper",
          },
          {
            id: "pending-3",
            type: "alert",
            title: "Memory usage warning",
            description: "LanceDB memory index approaching size limit",
            severity: "low",
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          },
        ]);

        setRisks([
          {
            id: "risk-1",
            type: "budget",
            title: "Token budget running low",
            description: "Current window at 72% capacity with 3 days remaining",
            severity: "medium",
            affected: ["agent-main", "agent-helper"],
          },
          {
            id: "risk-2",
            type: "stalled",
            title: "Documentation task stalled",
            description: "Task 'Generate API docs' has been in progress for 4 hours",
            severity: "low",
            affected: ["agent-docs"],
          },
        ]);

        setStaffStatus({
          working: 2,
          standby: 1,
          offline: 1,
          total: 4,
        });

        setLoading(false);
      }, 500);
    };
    loadData();
  }, []);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge variant="destructive" className="bg-orange-500">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
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
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            System status, pending items, and operational summary
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Status Indicators */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gateway</CardTitle>
            <Activity className={`h-4 w-4 ${
              systemHealth.gatewayStatus === "healthy" ? "text-green-500" :
              systemHealth.gatewayStatus === "degraded" ? "text-yellow-500" :
              "text-red-500"
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{systemHealth.gatewayStatus}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Uptime: {systemHealth.uptime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <Bot className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.totalAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {staffStatus.working} working, {staffStatus.standby} standby
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Channels</CardTitle>
            <Radio className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.connectedChannels}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
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
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${
              systemHealth.warnings > 0 || systemHealth.recentErrors > 0 ? "text-orange-500" : "text-gray-500"
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth.recentErrors + systemHealth.warnings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemHealth.recentErrors} errors, {systemHealth.warnings} warnings
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
                <CardTitle>Pending Items</CardTitle>
                <CardDescription>
                  {loading ? "Loading..." : `${pendingItems.length} items require attention`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
                <p className="text-muted-foreground">All caught up! No pending items.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingItems.map((item) => (
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
            <CardTitle>Risks</CardTitle>
            <CardDescription>
              {loading ? "Loading..." : `${risks.length} identified risks`}
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
                <p className="text-muted-foreground">No risks detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {risks.map((risk) => (
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
                          {risk.affected.length} affected
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
              <CardTitle>Staff Status</CardTitle>
              <CardDescription>
                {loading ? "Loading..." : `${staffStatus.working} working, ${staffStatus.standby} on standby`}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
                  <p className="text-xs text-muted-foreground">Working</p>
                </div>
              </div>

              {/* Standby */}
              <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Users className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{staffStatus.standby}</div>
                  <p className="text-xs text-muted-foreground">Standby</p>
                </div>
              </div>

              {/* Offline */}
              <div className="flex items-center gap-3 rounded-lg border border-gray-500/20 bg-gray-500/5 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10">
                  <PauseCircle className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{staffStatus.offline}</div>
                  <p className="text-xs text-muted-foreground">Offline</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              View Sessions
            </Button>
            <Button variant="outline" className="justify-start">
              <Bot className="mr-2 h-4 w-4" />
              Manage Agents
            </Button>
            <Button variant="outline" className="justify-start">
              <Radio className="mr-2 h-4 w-4" />
              Check Channels
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Open Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
