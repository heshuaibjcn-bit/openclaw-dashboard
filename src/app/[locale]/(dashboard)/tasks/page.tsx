"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Circle,
  CheckCircle2,
  XCircle,
  Pause,
  Search,
  Plus,
  Filter,
  Calendar,
  User,
  Tag,
  ArrowUpDown,
  RefreshCw,
  X,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useTasks } from "@/lib/openclaw";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed" | "blocked" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  projectId?: string;
  projectTitle?: string;
  assignedTo?: string;
  assigneeName?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  subtaskCount?: number;
  completedSubtasks?: number;
  taskType?: 'project' | 'cron';
  schedule?: string;
  cronExpression?: string;
  timezone?: string;
  enabled?: boolean;
}

export default function TasksPage() {
  const t = useTranslations('tasks');
  const tCommon = useTranslations('common');
  const tSeverity = useTranslations('severity');
  const locale = useLocale();
  const isZh = locale === 'zh';

  // Use real API for tasks data
  const { data: apiTasks, loading, error, refetch } = useTasks();

  const tasks = apiTasks || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "priority" | "due">("updated");

  // Task detail dialog state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Translate tag codes to display names
  const getTagName = (tag: string): string => {
    const tagMap: Record<string, { en: string; zh: string }> = {
      "code-review": { en: "Code Review", zh: "代码审查" },
      "security": { en: "Security", zh: "安全" },
      "documentation": { en: "Documentation", zh: "文档" },
      "bug": { en: "Bug", zh: "Bug" },
      "urgent": { en: "Urgent", zh: "紧急" },
      "feature": { en: "Feature", zh: "功能" },
      "enhancement": { en: "Enhancement", zh: "增强" },
    };
    const localeKey = locale as 'en' | 'zh';
    return tagMap[tag as keyof typeof tagMap]?.[localeKey] || tag;
  };

  // No mock data fallback - use real API only

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return <Circle className="h-4 w-4 text-gray-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "blocked":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">{t('status.pending')}</Badge>;
      case "in-progress":
        return <Badge variant="default">{t('status.inProgress')}</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-500">{t('status.completed')}</Badge>;
      case "blocked":
        return <Badge variant="destructive">{t('status.blocked')}</Badge>;
      case "cancelled":
        return <Badge variant="secondary">{t('status.cancelled')}</Badge>;
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="text-gray-500 border-gray-500">{t('priority.low')}</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-blue-500 border-blue-500">{t('priority.medium')}</Badge>;
      case "high":
        return <Badge variant="outline" className="text-orange-500 border-orange-500">{t('priority.high')}</Badge>;
      case "critical":
        return <Badge variant="destructive">{t('priority.critical')}</Badge>;
    }
  };

  const getPriorityOrder = (priority: Task["priority"]): number => {
    switch (priority) {
      case "critical": return 0;
      case "high": return 1;
      case "medium": return 2;
      case "low": return 3;
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !task.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !task.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      if (taskTypeFilter !== "all" && task.taskType !== taskTypeFilter) {
        return false;
      }
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "priority":
          return getPriorityOrder(a.priority) - getPriorityOrder(b.priority);
        case "due":
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    blocked: tasks.filter(t => t.status === "blocked").length,
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return tCommon('today');
    if (diffDays === 1) return tCommon('tomorrow');
    if (diffDays === -1) return tCommon('yesterday');
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    if (diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedTask(null);
  };

  const getOriginalTaskData = (task: Task) => {
    // Try to get original task data from task.json for project tasks
    if (task.taskType === 'project') {
      // For now, return the task as-is since we don't have the full acceptance criteria
      return task;
    }
    return task;
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
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {tCommon('refresh')}
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {tCommon('create')} {t('title')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.totalDesc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">项目任务</CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter(t => t.taskType === 'project').length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              来自 task.json
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cron 任务</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter(t => t.taskType === 'cron').length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              定时任务
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.pending')}</CardTitle>
            <Circle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.pendingDesc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.inProgress')}</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.inProgressDesc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.completed')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.completedDesc')}
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
            <Select value={taskTypeFilter} onValueChange={(value) => setTaskTypeFilter(value ?? 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="任务类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部任务</SelectItem>
                <SelectItem value="project">📋 项目任务</SelectItem>
                <SelectItem value="cron">⏰ Cron 任务</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={tCommon('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tCommon('all')} {tCommon('status')}</SelectItem>
                <SelectItem value="pending">{t('status.pending')}</SelectItem>
                <SelectItem value="in-progress">{t('status.inProgress')}</SelectItem>
                <SelectItem value="completed">{t('status.completed')}</SelectItem>
                <SelectItem value="blocked">{t('status.blocked')}</SelectItem>
                <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value ?? 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={tCommon('priority')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tCommon('all')} {tCommon('priority')}</SelectItem>
                <SelectItem value="critical">{tSeverity('critical')}</SelectItem>
                <SelectItem value="high">{tSeverity('high')}</SelectItem>
                <SelectItem value="medium">{tSeverity('medium')}</SelectItem>
                <SelectItem value="low">{tSeverity('low')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy((value ?? 'createdAt') as typeof sortBy)}>
              <SelectTrigger className="w-40">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder={tCommon('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Last Updated</SelectItem>
                <SelectItem value="created">{tCommon('date')}</SelectItem>
                <SelectItem value="priority">{tCommon('priority')}</SelectItem>
                <SelectItem value="due">Due {tCommon('date')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          // Skeleton loading state for tasks
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Skeleton className="h-5 w-5 rounded-full mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-6 w-20 rounded-full" />
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full max-w-md" />
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? t('noTasksFiltered')
                  : t('noTasks')}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={`hover:shadow-md transition-shadow ${
                task.taskType === 'cron' ? 'border-orange-200 bg-orange-50/30 dark:border-orange-900 dark:bg-orange-950/20' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      {getStatusIcon(task.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{task.title}</h3>
                          {task.taskType === 'cron' && (
                            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700">
                              ⏰ 定时
                            </Badge>
                          )}
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                      {task.taskType === 'cron' && (
                        <>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-orange-500" />
                            <span className="font-mono text-xs">{task.schedule}</span>
                          </div>
                          {task.cronExpression && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded dark:bg-orange-900 dark:text-orange-300">
                                {task.cronExpression}
                              </span>
                              {task.timezone && (
                                <span className="text-xs text-muted-foreground">
                                  ({task.timezone})
                                </span>
                              )}
                            </div>
                          )}
                          {task.enabled !== undefined && (
                            <div className="flex items-center gap-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${task.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                {task.enabled ? '已启用' : '已禁用'}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {task.taskType === 'project' && task.projectTitle && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span>{task.projectTitle}</span>
                        </div>
                      )}
                      {task.assigneeName && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{task.assigneeName}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      )}
                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {getTagName(tag)}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {task.subtaskCount && task.subtaskCount > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(task.completedSubtasks || 0) / task.subtaskCount * 100}%` }}
                          />
                        </div>
                        <span>{task.completedSubtasks || 0} / {task.subtaskCount} subtasks</span>
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(task)}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTask?.taskType === 'cron' && '⏰ '}
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedTask?.taskType === 'project' ? '项目任务详情' : '定时任务详情'}
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(selectedTask.status)}
                {getPriorityBadge(selectedTask.priority)}
                {selectedTask.taskType === 'cron' && (
                  <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-300">
                    定时任务
                  </Badge>
                )}
                {selectedTask.taskType === 'project' && (
                  <Badge variant="outline" className="text-xs">
                    项目任务
                  </Badge>
                )}
              </div>

              {/* Description */}
              {selectedTask.description && (
                <div>
                  <h4 className="text-sm font-medium mb-2">描述</h4>
                  <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                </div>
              )}

              {/* Cron-specific details */}
              {selectedTask.taskType === 'cron' && (
                <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    调度配置
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">调度时间:</span>
                      <span className="font-mono">{selectedTask.schedule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cron 表达式:</span>
                      <span className="font-mono bg-orange-100 px-2 py-0.5 rounded dark:bg-orange-900 dark:text-orange-300">
                        {selectedTask.cronExpression}
                      </span>
                    </div>
                    {selectedTask.timezone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">时区:</span>
                        <span>{selectedTask.timezone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">状态:</span>
                      <span className={selectedTask.enabled ? 'text-green-600' : 'text-gray-600'}>
                        {selectedTask.enabled ? '✓ 已启用' : '✗ 已禁用'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Project-specific details */}
              {selectedTask.taskType === 'project' && selectedTask.subtaskCount && selectedTask.subtaskCount > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">验收标准</h4>
                  <div className="space-y-2">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(selectedTask.completedSubtasks || 0) / selectedTask.subtaskCount * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>进度</span>
                      <span>{selectedTask.completedSubtasks || 0} / {selectedTask.subtaskCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">创建时间:</span>
                  <p className="font-mono">{new Date(selectedTask.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">更新时间:</span>
                  <p className="font-mono">{new Date(selectedTask.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Tags */}
              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">标签</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTask.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {getTagName(tag)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDetailDialog}>
              关闭
            </Button>
            {selectedTask?.taskType === 'project' && (
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </Button>
            )}
            {selectedTask?.taskType === 'cron' && selectedTask.enabled && (
              <Button variant="destructive">
                <Pause className="mr-2 h-4 w-4" />
                禁用
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
