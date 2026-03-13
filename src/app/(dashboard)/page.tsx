import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  MessageSquare,
  Bot,
  Radio,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Gateway Status",
      value: "Connected",
      description: "Local gateway running on port 18789",
      icon: Activity,
      status: "success",
    },
    {
      title: "Active Sessions",
      value: "1",
      description: "1 active session with GLM-5 model",
      icon: MessageSquare,
      status: "info",
    },
    {
      title: "Agents",
      value: "1",
      description: "Main agent configured and running",
      icon: Bot,
      status: "info",
    },
    {
      title: "Channels",
      value: "2",
      description: "iMessage and Feishu connected",
      icon: Radio,
      status: "success",
    },
  ];

  const recentActivity = [
    { time: "2 min ago", event: "Agent response sent", type: "agent" },
    { time: "5 min ago", event: "Feishu message received", type: "channel" },
    { time: "10 min ago", event: "Session started", type: "session" },
    { time: "15 min ago", event: "Memory indexed", type: "system" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to OpenClaw Dashboard. Here's what's happening.
          </p>
        </div>
        <Button>Quick Actions</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <Badge
                variant={stat.status === "success" ? "default" : "secondary"}
                className="mt-2"
              >
                {stat.status === "success" ? "Active" : "Info"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Gateway performance and activity summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <span className="text-sm text-muted-foreground">333ms</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Token Usage</span>
              </div>
              <span className="text-sm text-muted-foreground">31k / 205k (15%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Last Heartbeat</span>
              </div>
              <span className="text-sm text-muted-foreground">30m ago</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events from your gateway</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.type === "agent"
                          ? "bg-blue-500"
                          : activity.type === "channel"
                          ? "bg-green-500"
                          : activity.type === "session"
                          ? "bg-purple-500"
                          : "bg-gray-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.event}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>
            Get started with OpenClaw Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <h4 className="font-medium">View Sessions</h4>
            <p className="text-sm text-muted-foreground">
              Monitor active sessions and their token usage
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Go to Sessions
            </Button>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Manage Agents</h4>
            <p className="text-sm text-muted-foreground">
              Configure and manage your AI agents
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Go to Agents
            </Button>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Check Channels</h4>
            <p className="text-sm text-muted-foreground">
              View connected channels and their status
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Go to Channels
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
