"use client";

import { useState } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Play,
  Search,
  Plus,
  Calendar,
  User,
  Tag,
  ArrowUpDown,
  RefreshCw,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useTasks } from "@/lib/openclaw";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

  // Use real API for tasks data
  const { data: apiTasks, loading, refetch } = useTasks();

  const tasks = apiTasks || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "priority" | "due">("updated");

  // Task detail dialog state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Create task dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'pending' as Task['status'],
    tags: '',
    dueDate: '',
    assignedTo: '',
    acceptanceCriteria: '',
  });

  // Edit task dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'pending' as Task['status'],
    tags: '',
    dueDate: '',
    assignedTo: '',
    acceptanceCriteria: '',
  });

  // Delete task dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

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
    .filter((task) => {
      const t = task as Task;
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !t.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !t.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      if (taskTypeFilter !== "all" && t.taskType !== taskTypeFilter) {
        return false;
      }
      if (statusFilter !== "all" && t.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== "all" && t.priority !== priorityFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const taskA = a as Task;
      const taskB = b as Task;
      switch (sortBy) {
        case "updated":
          return new Date(taskB.updatedAt).getTime() - new Date(taskA.updatedAt).getTime();
        case "created":
          return new Date(taskB.createdAt).getTime() - new Date(taskA.createdAt).getTime();
        case "priority":
          return getPriorityOrder(taskA.priority as "low" | "medium" | "high" | "critical") - getPriorityOrder(taskB.priority as "low" | "medium" | "high" | "critical");
        case "due":
          if (!taskA.dueDate) return 1;
          if (!taskB.dueDate) return -1;
          return new Date(taskA.dueDate as string || '').getTime() - new Date(taskB.dueDate as string || '').getTime();
      }
    });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => (t as Task).status === "pending").length,
    inProgress: tasks.filter(t => (t as Task).status === "in-progress").length,
    completed: tasks.filter(t => (t as Task).status === "completed").length,
    blocked: tasks.filter(t => (t as Task).status === "blocked").length,
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

  // Quick status update handler
  const handleQuickStatusUpdate = async (task: Task, newStatus: Task['status']) => {
    if (task.taskType === 'cron') {
      // For cron tasks, toggle enabled status instead
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      refetch();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Create task handlers
  const handleOpenCreateDialog = () => {
    setCreateFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      tags: '',
      dueDate: '',
      assignedTo: '',
      acceptanceCriteria: '',
    });
    setIsCreateDialogOpen(true);
  };

  const handleCreateTask = async () => {
    if (!createFormData.title.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createFormData),
      });

      if (!response.ok) throw new Error('Failed to create task');

      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Edit task handlers
  const handleOpenEditDialog = (task: Task) => {
    setSelectedTask(task);
    setEditFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      tags: task.tags?.join(', ') || '',
      dueDate: task.dueDate || '',
      assignedTo: task.assignedTo || '',
      acceptanceCriteria: '',
    });
    setIsEditDialogOpen(true);
    setIsDetailDialogOpen(false);
  };

  const handleEditTask = async () => {
    if (!selectedTask || !editFormData.title.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTask.id,
          ...editFormData,
        }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      setIsEditDialogOpen(false);
      setSelectedTask(null);
      refetch();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete task handlers
  const handleOpenDeleteDialog = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
    setIsDetailDialogOpen(false);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const response = await fetch(`/api/tasks?id=${taskToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');

      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
      refetch();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedTask(null);
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
          <Button onClick={handleOpenCreateDialog}>
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
            <div className="text-2xl font-bold">{tasks.filter(t => (t as Task).taskType === 'project').length}</div>
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
            <div className="text-2xl font-bold">{tasks.filter(t => (t as Task).taskType === 'cron').length}</div>
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
          filteredTasks.map((task) => {
            const taskItem = task as Task;
            return (
              <Card
                key={taskItem.id}
                className={`hover:shadow-md transition-shadow ${
                  taskItem.taskType === 'cron' ? 'border-orange-200 bg-orange-50/30 dark:border-orange-900 dark:bg-orange-950/20' : ''
                }`}
              >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      {getStatusIcon(taskItem.status as Task["status"])}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{taskItem.title}</h3>
                          {taskItem.taskType === 'cron' && (
                            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700">
                              ⏰ 定时
                            </Badge>
                          )}
                          {getStatusBadge(taskItem.status as Task["status"])}
                          {getPriorityBadge(taskItem.priority as "low" | "medium" | "high" | "critical")}
                        </div>
                        {taskItem.description && (
                          <p className="text-sm text-muted-foreground mt-1">{taskItem.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                      {taskItem.taskType === 'cron' && (
                        <>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-orange-500" />
                            <span className="font-mono text-xs">{taskItem.schedule}</span>
                          </div>
                          {taskItem.cronExpression && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded dark:bg-orange-900 dark:text-orange-300">
                                {taskItem.cronExpression}
                              </span>
                              {taskItem.timezone && (
                                <span className="text-xs text-muted-foreground">
                                  ({taskItem.timezone})
                                </span>
                              )}
                            </div>
                          )}
                          {taskItem.enabled !== undefined && (
                            <div className="flex items-center gap-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${taskItem.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                {taskItem.enabled ? '已启用' : '已禁用'}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {taskItem.taskType === 'project' && (taskItem.projectTitle as string | undefined) && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span>{taskItem.projectTitle as string}</span>
                        </div>
                      )}
                      {(taskItem.assigneeName as string | undefined) && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{taskItem.assigneeName as string}</span>
                        </div>
                      )}
                      {(taskItem.dueDate as string | undefined) && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(taskItem.dueDate as string)}</span>
                        </div>
                      )}
                    </div>

                    {taskItem.tags && taskItem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {taskItem.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {getTagName(tag)}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {taskItem.subtaskCount && taskItem.subtaskCount > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(taskItem.completedSubtasks || 0) / taskItem.subtaskCount * 100}%` }}
                          />
                        </div>
                        <span>{taskItem.completedSubtasks || 0} / {taskItem.subtaskCount} subtasks</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick status update buttons for project tasks */}
                    {taskItem.taskType === 'project' && (
                      <div className="flex items-center gap-1">
                        {taskItem.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickStatusUpdate(taskItem, 'in-progress')}
                            title="Start task"
                          >
                            <Play className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}
                        {taskItem.status === 'in-progress' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickStatusUpdate(taskItem, 'completed')}
                            title="Complete task"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Action menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center justify-center p-2 hover:bg-accent rounded-md">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('actions.quickUpdate')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {taskItem.taskType === 'project' && (
                          <>
                            <DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(taskItem, 'pending')}>
                                <Circle className="mr-2 h-4 w-4 text-gray-500" />
                                {t('actions.markAs')} {t('status.pending')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(taskItem, 'in-progress')}>
                                <Clock className="mr-2 h-4 w-4 text-blue-500" />
                                {t('actions.markAs')} {t('status.inProgress')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(taskItem, 'completed')}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                {t('actions.markAs')} {t('status.completed')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickStatusUpdate(taskItem, 'blocked')}>
                                <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                                {t('actions.markAs')} {t('status.blocked')}
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={() => handleViewDetails(taskItem)}>
                          <Search className="mr-2 h-4 w-4" />
                          {tCommon('viewDetails')}
                        </DropdownMenuItem>
                        {taskItem.taskType === 'project' && (
                          <>
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(taskItem)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('actions.editTask')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenDeleteDialog(taskItem)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('actions.deleteTask')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })
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
              {tCommon('close')}
            </Button>
            {selectedTask?.taskType === 'project' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleOpenEditDialog(selectedTask)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t('actions.editTask')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleOpenDeleteDialog(selectedTask)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('actions.deleteTask')}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('create.title')}</DialogTitle>
            <DialogDescription>{t('create.description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="create-title">{t('create.titlePlaceholder')} *</Label>
              <Input
                id="create-title"
                value={createFormData.title}
                onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                placeholder={t('create.titlePlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="create-description">{tCommon('description')}</Label>
              <Textarea
                id="create-description"
                value={createFormData.description}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                placeholder={t('create.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-priority">{t('create.priority')}</Label>
                <Select
                  value={createFormData.priority}
                  onValueChange={(value) => setCreateFormData({ ...createFormData, priority: value as 'low' | 'medium' | 'high' | 'critical' })}
                >
                  <SelectTrigger id="create-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('priority.low')}</SelectItem>
                    <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                    <SelectItem value="high">{t('priority.high')}</SelectItem>
                    <SelectItem value="critical">{t('priority.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="create-status">{t('create.status')}</Label>
                <Select
                  value={createFormData.status}
                  onValueChange={(value) => setCreateFormData({ ...createFormData, status: value as Task['status'] })}
                >
                  <SelectTrigger id="create-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('status.pending')}</SelectItem>
                    <SelectItem value="in-progress">{t('status.inProgress')}</SelectItem>
                    <SelectItem value="completed">{t('status.completed')}</SelectItem>
                    <SelectItem value="blocked">{t('status.blocked')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="create-tags">{t('create.tags')}</Label>
              <Input
                id="create-tags"
                value={createFormData.tags}
                onChange={(e) => setCreateFormData({ ...createFormData, tags: e.target.value })}
                placeholder={t('create.tags')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-dueDate">{t('create.dueDate')}</Label>
                <Input
                  id="create-dueDate"
                  type="date"
                  value={createFormData.dueDate}
                  onChange={(e) => setCreateFormData({ ...createFormData, dueDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="create-assignee">{t('create.assignee')}</Label>
                <Input
                  id="create-assignee"
                  value={createFormData.assignedTo}
                  onChange={(e) => setCreateFormData({ ...createFormData, assignedTo: e.target.value })}
                  placeholder={t('create.assignee')}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleCreateTask} disabled={!createFormData.title.trim()}>
              {t('create.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('edit.title')}</DialogTitle>
            <DialogDescription>{t('edit.description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">{t('create.titlePlaceholder')} *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder={t('create.titlePlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="edit-description">{tCommon('description')}</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder={t('create.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-priority">{t('create.priority')}</Label>
                <Select
                  value={editFormData.priority}
                  onValueChange={(value) => setEditFormData({ ...editFormData, priority: value as 'low' | 'medium' | 'high' | 'critical' })}
                >
                  <SelectTrigger id="edit-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('priority.low')}</SelectItem>
                    <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                    <SelectItem value="high">{t('priority.high')}</SelectItem>
                    <SelectItem value="critical">{t('priority.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-status">{t('create.status')}</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value as Task['status'] })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('status.pending')}</SelectItem>
                    <SelectItem value="in-progress">{t('status.inProgress')}</SelectItem>
                    <SelectItem value="completed">{t('status.completed')}</SelectItem>
                    <SelectItem value="blocked">{t('status.blocked')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-tags">{t('create.tags')}</Label>
              <Input
                id="edit-tags"
                value={editFormData.tags}
                onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                placeholder={t('create.tags')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-dueDate">{t('create.dueDate')}</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-assignee">{t('create.assignee')}</Label>
                <Input
                  id="edit-assignee"
                  value={editFormData.assignedTo}
                  onChange={(e) => setEditFormData({ ...editFormData, assignedTo: e.target.value })}
                  placeholder={t('create.assignee')}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleEditTask} disabled={!editFormData.title.trim()}>
              {t('edit.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete.title')}</DialogTitle>
            <DialogDescription>
              {taskToDelete?.title ? `${t('delete.confirm')} "${taskToDelete.title}"?` : t('delete.confirm')}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('delete.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              {t('delete.confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
