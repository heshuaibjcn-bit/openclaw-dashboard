"use client";

import { useState, useEffect, useMemo } from "react";
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
import { useUsage, useSubscription } from "@/lib/openclaw";

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
  const [timeRange, setTimeRange] = useState<"today" | "7days" | "30days">("7days");
  const [view, setView] = useState<"tasks" | "agents" | "projects">("tasks");

  // Use real API hooks
  const { data: usageData, loading: usageLoading, refetch: refetchUsage } = useUsage(timeRange);
  const { data: subscriptionData, loading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();

  const loading = usageLoading || subscriptionLoading;

  // Process data from API
  const data = useMemo(() => {
    return {
      today: usageData?.today || { tokens: 0, cost: 0 },
      last7days: usageData?.last7days || { tokens: 0, cost: 0 },
      last30days: usageData?.last30days || { tokens: 0, cost: 0 },
      quota: {
        limit: subscriptionData?.quota?.limit || 1000000,
        used: subscriptionData?.quota?.used || 0,
        remaining: subscriptionData?.quota?.remaining || 0,
        window: subscriptionData?.quota?.window || "Week",
        resetAt: subscriptionData?.quota?.resetAt || "",
      },
      attribution: usageData?.attribution || [],
    };
  }, [usageData, subscriptionData]);

  const getCurrentData = () => {
    switch (timeRange) {
      case "today": return data.today;
      case "7days": return data.last7days;
      case "30days": return data.last30days;
    }
  };

  const getQuotaPercentage = () => {
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

  const handleRefresh = () => {
    refetchUsage();
    refetchSubscription();
  };

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
            {t('today')}
          </Button>
          <Button
            variant={timeRange === "7days" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("7days")}
          >
            {t('days7')}
          </Button>
          <Button
            variant={timeRange === "30days" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("30days")}
          >
            {t('days30')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {tCommon('refresh')}
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          </CardContent>
        </Card>
      ) : data && currentData ? (
        <>
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('tokensUsed')}</CardTitle>
                <Zap className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('inSelectedPeriod')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('cost')}</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${currentData.cost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('inSelectedPeriod')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quotaUsed')}</CardTitle>
                <PieChart className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getQuotaPercentage().toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.quota.remaining.toLocaleString()} {t('remaining')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('quotaStatus')}</CardTitle>
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
                  <CardTitle>{t('quotaUsage')}</CardTitle>
                  <CardDescription>
                    {t('currentSubscriptionWindow')}: {data.quota.window}
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
                    {data.quota.used.toLocaleString()} / {data.quota.limit.toLocaleString()} {t('tokens')}
                  </span>
                  <span className="text-muted-foreground">
                    {t('resets')}: {new Date(data.quota.resetAt).toLocaleDateString()}
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
                  <CardTitle>{t('tokenAttribution')}</CardTitle>
                  <CardDescription>
                    {t('seeWhereTokensAreBeingConsumed')}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={view === "tasks" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("tasks")}
                  >
                    {t('tasks')}
                  </Button>
                  <Button
                    variant={view === "agents" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("agents")}
                  >
                    {t('agents')}
                  </Button>
                  <Button
                    variant={view === "projects" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("projects")}
                  >
                    {t('projects')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAttribution.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('noAttributionDataAvailable')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAttribution.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type === 'task' ? t('task') : item.type === 'agent' ? t('agents') : item.type}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{item.tokens.toLocaleString()} {t('tokens')}</span>
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
                        <span>{t('avgPer1MTokens', { cost: (item.cost / item.tokens * 1000000).toFixed(2) })}</span>
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
                <CardTitle className="text-sm font-medium">{t('todayVsYesterday')}</CardTitle>
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
                <CardTitle className="text-sm font-medium">{t('trend7Day')}</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.last7days.tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('avgPerDay', { count: Math.round(data.last7days.tokens / 7).toLocaleString() })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('trend30Day')}</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.last30days.tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('avgPerDay', { count: Math.round(data.last30days.tokens / 30).toLocaleString() })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Data Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dataConnectionStatus')}</CardTitle>
              <CardDescription>
                {t('statusOfUsageAndCostDataSources')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">{t('openclawGateway')}</span>
                  </div>
                  <Badge variant="default">{tCommon('connected')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">{t('runtimeData')}</span>
                  </div>
                  <Badge variant="default">{tCommon('connected')}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-sm">{t('subscriptionData')}</span>
                  </div>
                  <Badge variant="outline">{t('partial')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('unableToLoadUsageData')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('checkConnection')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
