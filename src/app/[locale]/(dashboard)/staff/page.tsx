"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

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
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await fetchStaffStatus();
      setTimeout(() => {
        setStaff([
          {
            id: "agent-main",
            name: "Main Assistant",
            model: "zai/glm-5",
            status: "working",
            currentTask: {
              id: "task-1",
              title: "Processing code review requests",
              progress: 65,
              startedAt: new Date(Date.now() - 1000 * 60 * 15),
            },
            nextTask: {
              id: "task-2",
              title: "Generate documentation",
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
            name: "Helper Bot",
            model: "zai/glm-4.7",
            status: "standby",
            nextTask: {
              id: "task-3",
              title: "Bug investigation",
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
            name: "Documentation Agent",
            model: "zai/glm-4.7-flash",
            status: "offline",
            recentOutput: {
              count: 8,
              lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
            },
            capabilities: ["documentation", "writing"],
            uptime: 0,
          },
        ]);
        setLoading(false);
      }, 500);
    };
    loadData();
  }, []);

  const getStatusBadge = (status: StaffMember["status"]) => {
    switch (status) {
      case "working":
        return <Badge variant="default" className="bg-green-500">Working</Badge>;
      case "standby":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Standby</Badge>;
      case "offline":
        return <Badge variant="secondary">Offline</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
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
          <h2 className="text-2xl font-bold tracking-tight">Staff</h2>
          <p className="text-muted-foreground">
            Monitor agent work status and activity
          </p>
        </div>
        <Button variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Configured agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.working}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Actively processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standby</CardTitle>
            <Pause className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.standby}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Output Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOutput}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.offline}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Not active
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
                <p className="text-muted-foreground">Loading staff status...</p>
              </div>
            </CardContent>
          </Card>
        ) : staff.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No agents configured</p>
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
                          {cap}
                        </Badge>
                      ))}
                    </div>

                    {/* Current/Next Task */}
                    {member.currentTask ? (
                      <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                          <Play className="h-4 w-4" />
                          <span>Currently Processing</span>
                        </div>
                        <p className="text-sm">{member.currentTask.title}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
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
                          <span>Started {formatLastActivity(member.currentTask.startedAt)}</span>
                        </div>
                      </div>
                    ) : member.nextTask ? (
                      <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-yellow-600">
                          <Pause className="h-4 w-4" />
                          <span>Next Up</span>
                        </div>
                        <p className="text-sm">{member.nextTask.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Scheduled {formatLastActivity(member.nextTask.scheduledAt)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border bg-muted/50 p-3">
                        <p className="text-sm text-muted-foreground">No tasks scheduled</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Stats */}
                  <div className="w-48 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(member.status)}
                          <span className="font-medium capitalize">{member.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{formatUptime(member.uptime)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Output</span>
                        <span className="font-medium">{member.recentOutput.count} tasks</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Activity</span>
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
          <CardTitle>Status Legend</CardTitle>
          <CardDescription>Understanding agent status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 flex-shrink-0">
                <Play className="h-4 w-4 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Working</p>
                <p className="text-xs text-muted-foreground">
                  Agent is actively processing a task
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 flex-shrink-0">
                <Pause className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Standby</p>
                <p className="text-xs text-muted-foreground">
                  Has queued tasks but not currently executing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-500/10 flex-shrink-0">
                <Clock className="h-4 w-4 text-gray-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Offline</p>
                <p className="text-xs text-muted-foreground">
                  Agent is not active or enabled
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Error</p>
                <p className="text-xs text-muted-foreground">
                  Agent has encountered an error
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
