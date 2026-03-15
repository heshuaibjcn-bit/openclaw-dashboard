"use client";

import { useState, useMemo } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  FileText,
  RefreshCw,
  Search,
  Eye,
  Check,
  X,
  Archive,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useApprovals } from "@/lib/openclaw";

type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";
type ActionCategory = "mutation" | "import" | "export" | "config" | "channel" | "agent";

interface ApprovalAction {
  id: string;
  type: string;
  category: ActionCategory;
  description: string;
  status: ApprovalStatus;
  createdAt: Date;
  expiresAt: Date;
  requestedBy: string;
  agent?: string;
  channel?: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  details?: Record<string, unknown>;
}

const statusBadges = {
  pending: { variant: "outline" as const, color: "border-yellow-500 text-yellow-500", icon: Clock },
  approved: { variant: "default" as const, color: "bg-green-500", icon: CheckCircle },
  rejected: { variant: "secondary" as const, color: "bg-red-500", icon: XCircle },
  expired: { variant: "secondary" as const, color: "bg-gray-500", icon: AlertCircle },
};

const riskColors = {
  low: "text-blue-500",
  medium: "text-yellow-500",
  high: "text-orange-500",
  critical: "text-red-500",
};

export default function ApprovalsPage() {
  const t = useTranslations('approvals');
  const tCommon = useTranslations('common');
  const [selectedAction, setSelectedAction] = useState<ApprovalAction | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dryRun, setDryRun] = useState(true);

  // Use real API hook - will fetch filtered data based on statusFilter
  const { data: apiData, loading, refetch, approveAction, rejectAction } = useApprovals(
    statusFilter === "all" ? undefined : statusFilter
  );

  // Extract results from API response (which has format { results: [], count, method })
  const apiActions: ApprovalAction[] = useMemo(() => {
    if (!apiData) return [];
    if (Array.isArray(apiData)) {
      return apiData as ApprovalAction[];
    }
    // Handle API response format: { results: [], count, method }
    const dataObj = apiData as { results?: ApprovalAction[] };
    return dataObj.results || [];
  }, [apiData]);

  // Apply client-side filtering for category and search
  const filteredActions = useMemo(() => {
    let filtered = apiActions || [];

    if (categoryFilter !== "all") {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [apiActions, categoryFilter, searchQuery]);

  const handleApprove = async (id: string) => {
    if (dryRun) {
      console.log(`[DRY-RUN] Would approve action: ${id}`);
    } else {
      try {
        await approveAction(id);
      } catch (error) {
        console.error("Failed to approve action:", error);
      }
    }
    if (dryRun) {
      // For dry run, manually update the status locally
      // This is just for UI feedback
    }
    if (selectedAction?.id === id) {
      setSelectedAction(null);
    }
  };

  const handleReject = async (id: string) => {
    if (dryRun) {
      console.log(`[DRY-RUN] Would reject action: ${id}`);
    } else {
      try {
        await rejectAction(id);
      } catch (error) {
        console.error("Failed to reject action:", error);
      }
    }
    if (dryRun) {
      // For dry run, manually update the status locally
      // This is just for UI feedback
    }
    if (selectedAction?.id === id) {
      setSelectedAction(null);
    }
  };

  const handleBatchApprove = () => {
    const pendingIds = filteredActions.filter(a => a.status === "pending").map(a => a.id);
    pendingIds.forEach(id => handleApprove(id));
  };

  const handleBatchReject = () => {
    const pendingIds = filteredActions.filter(a => a.status === "pending").map(a => a.id);
    pendingIds.forEach(id => handleReject(id));
  };

  const handleRefresh = () => {
    refetch();
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    const config = statusBadges[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryIcon = (category: ActionCategory) => {
    switch (category) {
      case "config": return <Shield className="h-4 w-4 text-blue-500" />;
      case "import": return <FileText className="h-4 w-4 text-green-500" />;
      case "export": return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case "channel": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "agent": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const stats = {
    pending: (apiActions || []).filter(a => a.status === "pending").length,
    approved: (apiActions || []).filter(a => a.status === "approved").length,
    rejected: (apiActions || []).filter(a => a.status === "rejected").length,
    highRisk: (apiActions || []).filter(a => (a.riskLevel === "high" || a.riskLevel === "critical") && a.status === "pending").length,
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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              id="dryRun"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="dryRun">{t('dryRun')}</label>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {tCommon('refresh')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tCommon('pending')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('awaitingApproval')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tCommon('approved')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('approvedActions')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tCommon('rejected')}</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('rejectedActions')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('highRisk')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highRisk}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('requiresAttention')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={tCommon('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tCommon('all')} {tCommon('status')}</SelectItem>
                <SelectItem value="pending">{tCommon('pending')}</SelectItem>
                <SelectItem value="approved">{tCommon('completed')}</SelectItem>
                <SelectItem value="rejected">{t('rejected')}</SelectItem>
                <SelectItem value="expired">{t('expired')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(value) => value && setCategoryFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={tCommon('type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tCommon('all')} {t('categories')}</SelectItem>
                <SelectItem value="config">{t('config')}</SelectItem>
                <SelectItem value="import">{t('import')}</SelectItem>
                <SelectItem value="export">{t('export')}</SelectItem>
                <SelectItem value="channel">{t('channel')}</SelectItem>
                <SelectItem value="agent">{t('agent')}</SelectItem>
              </SelectContent>
            </Select>
            {statusFilter === "pending" && (
              <>
                <Button variant="outline" size="sm" onClick={handleBatchReject}>
                  <X className="mr-2 h-4 w-4" />
                  {tCommon('all')} {tCommon('delete')}
                </Button>
                <Button size="sm" onClick={handleBatchApprove}>
                  <Check className="mr-2 h-4 w-4" />
                  {tCommon('all')} {tCommon('confirm')}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Details Panel */}
      {selectedAction && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{t('actionDetails')}: {selectedAction.id}</CardTitle>
                <CardDescription>
                  {selectedAction.type}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedAction(null)}>
                {t('close')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{tCommon('status')}</p>
                <p className="font-medium">{getStatusBadge(selectedAction.status)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('riskLevel')}</p>
                <p className={`font-medium ${riskColors[selectedAction.riskLevel as keyof typeof riskColors] || riskColors.medium}`}>
                  {selectedAction.riskLevel?.toUpperCase() || 'UNKNOWN'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('requestedBy')}</p>
                <p className="font-medium">{selectedAction.requestedBy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('expires')}</p>
                <p className="font-medium">{selectedAction.expiresAt.toLocaleString()}</p>
              </div>
            </div>
            {selectedAction.details && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t('details')}</p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(selectedAction.details, null, 2)}
                </pre>
              </div>
            )}
            {selectedAction.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    handleReject(selectedAction.id);
                    setSelectedAction(null);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  {t('reject')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleApprove(selectedAction.id);
                    setSelectedAction(null);
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {t('approve')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : filteredActions.length > 0 ? (
          filteredActions.map((action) => (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(action.category)}
                      <p className="font-medium">{action.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {action.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                      <span>ID: {action.id}</span>
                      <span>•</span>
                      <span>Requested by: {action.requestedBy}</span>
                      {action.agent && (
                        <>
                          <span>•</span>
                          <span>Agent: {action.agent}</span>
                        </>
                      )}
                      {action.channel && (
                        <>
                          <span>•</span>
                          <span>Channel: {action.channel}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{action.createdAt.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(action.status)}
                      <Badge variant="outline" className={`text-xs ${riskColors[action.riskLevel as keyof typeof riskColors] || riskColors.medium}`}>
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {action.riskLevel?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAction(action)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {action.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(action.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(action.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                  ? t('noActionsMatchFilters')
                  : t('noApprovalActionsFound')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('aboutApprovalActions')}</CardTitle>
          <CardDescription>{t('aboutDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <h4 className="font-medium">{t('pendingActions.title')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('pendingActions.description')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h4 className="font-medium">{t('riskLevels.title')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('riskLevels.description')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium">{t('actionHistory.title')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('actionHistory.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
