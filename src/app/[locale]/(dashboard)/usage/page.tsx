"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  PieChart,
  BarChart3,
  Zap,
  Calendar,
} from "lucide-react";

// Mock data (will be replaced with real API calls)
interface UsageData {
  today: { tokens: number; cost: number };
  last7days: { tokens: number; cost: number };
  last30days: { tokens: number; cost: number };
  quota: {
    limit: number;
    used: number;
    remaining: number;
    window: string;
    resetAt: string;
  };
  attribution: Array<{
    id: string;
    name: string;
    type: "task" | "agent" | "project";
    tokens: number;
    cost: number;
    percentage: number;
  }>;
}

export default function UsagePage() {
  const t = useTranslations('usage');
  const tCommon = useTranslations('common');
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"today" | "7days" | "30days">("7days");
  const [view, setView] = useState<"tasks" | "agents" | "projects">("tasks");

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await fetchUsageCost();
      setTimeout(() => {
        setData({
          today: { tokens: 45000, cost: 0.45 },
          last7days: { tokens: 280000, cost: 2.80 },
          last30days: { tokens: 950000, cost: 9.50 },
          quota: {
            limit: 1000000,
            used: 280000,
            remaining: 720000,
            window: "Week",
            resetAt: "2025-03-20T00:00:00Z",
          },
          attribution: [
            { id: "task1", name: "Code Review", type: "task", tokens: 85000, cost: 0.85, percentage: 30.4 },
            { id: "task2", name: "Documentation", type: "task", tokens: 62000, cost: 0.62, percentage: 22.1 },
            { id: "task3", name: "Bug Fix", type: "task", tokens: 48000, cost: 0.48, percentage: 17.1 },
            { id: "agent1", name: "Main Agent", type: "agent", tokens: 155000, cost: 1.55, percentage: 55.4 },
            { id: "agent2", name: "Helper Agent", type: "agent", tokens: 125000, cost: 1.25, percentage: 44.6 },
          ],
        });
        setLoading(false);
      }, 500);
    };
    loadData();
  }, []);

  const getCurrentData = () => {
    if (!data) return null;
    switch (timeRange) {
      case "today": return data.today;
      case "7days": return data.last7days;
      case "30days": return data.last30days;
    }
  };

  const getQuotaPercentage = () => {
    if (!data) return 0;
    return (data.quota.used / data.quota.limit) * 100;
  };

  const getQuotaStatus = () => {
    const percentage = getQuotaPercentage();
    if (percentage >= 95) return { status: "critical", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" };
    if (percentage >= 80) return { status: "warning", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" };
    return { status: "healthy", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" };
  };

  const currentData = getCurrentData();
  const quotaStatus = getQuotaStatus();

  const filteredAttribution = data?.attribution.filter(item => {
    if (view === "tasks") return item.type === "task";
    if (view === "agents") return item.type === "agent";
    if (view === "projects") return item.type === "project";
    return true;
  }) || [];

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
            variant={timeRange === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("today")}
          >
            Today
          </Button>
          <Button
            variant={timeRange === "7days" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("7days")}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === "30days" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("30days")}
          >
            30 Days
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading usage data...</p>
            </div>
          </CardContent>
        </Card>
      ) : data && currentData ? (
        <>
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
                <Zap className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  In selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${currentData.cost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  In selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quota Used</CardTitle>
                <PieChart className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getQuotaPercentage().toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.quota.remaining.toLocaleString()} remaining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quota Status</CardTitle>
                {quotaStatus.status === "healthy" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : quotaStatus.status === "warning" ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{quotaStatus.status}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Resets in {data.quota.window}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quota Progress */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quota Usage</CardTitle>
                  <CardDescription>
                    Current subscription window: {data.quota.window}
                  </CardDescription>
                </div>
                <Badge variant={quotaStatus.status === "healthy" ? "default" : quotaStatus.status === "warning" ? "outline" : "destructive"}>
                  {quotaStatus.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`absolute h-full transition-all ${
                      quotaStatus.status === "healthy"
                        ? "bg-green-500"
                        : quotaStatus.status === "warning"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${getQuotaPercentage()}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {data.quota.used.toLocaleString()} / {data.quota.limit.toLocaleString()} tokens
                  </span>
                  <span className="text-muted-foreground">
                    Resets: {new Date(data.quota.resetAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Attribution */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Token Attribution</CardTitle>
                  <CardDescription>
                    See where tokens are being consumed
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={view === "tasks" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("tasks")}
                  >
                    Tasks
                  </Button>
                  <Button
                    variant={view === "agents" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("agents")}
                  >
                    Agents
                  </Button>
                  <Button
                    variant={view === "projects" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("projects")}
                  >
                    Projects
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAttribution.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No attribution data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAttribution.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{item.tokens.toLocaleString()} tokens</span>
                          <span className="text-muted-foreground ml-2">
                            ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>${item.cost.toFixed(2)}</span>
                        <span>Avg: ${(item.cost / item.tokens * 1000000).toFixed(2)} per 1M tokens</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cost Trends */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today vs Yesterday</CardTitle>
                {data.today.tokens > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.today.tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.today.cost > 0 ? "+" : ""}${data.today.cost.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">7-Day Trend</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.last7days.tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg {Math.round(data.last7days.tokens / 7).toLocaleString()} / day
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">30-Day Trend</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.last30days.tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg {Math.round(data.last30days.tokens / 30).toLocaleString()} / day
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Data Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle>Data Connection Status</CardTitle>
              <CardDescription>
                Status of usage and cost data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">OpenClaw Gateway</span>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">Runtime Data</span>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-sm">Subscription Data</span>
                  </div>
                  <Badge variant="outline">Partial</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Unable to load usage data</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check your connection to OpenClaw Gateway
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
