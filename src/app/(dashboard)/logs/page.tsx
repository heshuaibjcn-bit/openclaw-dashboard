"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  RefreshCw,
  Search,
  Download,
  Pause,
  Play,
  Trash2,
  AlertTriangle,
  Info,
  Bug,
  AlertCircle,
} from "lucide-react";
import { useLogs } from "@/lib/openclaw";
import type { LogEntry } from "@/lib/openclaw";

const levelIcons = {
  debug: Bug,
  info: Info,
  warn: AlertTriangle,
  error: AlertCircle,
};

const levelColors = {
  debug: "text-gray-500",
  info: "text-blue-500",
  warn: "text-yellow-500",
  error: "text-red-500",
};

const levelBadges = {
  debug: "secondary",
  info: "default",
  warn: "outline",
  error: "destructive",
} as const;

export default function LogsPage() {
  const { data: logs, loading, refetch } = useLogs();
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter logs based on level and search query
  useEffect(() => {
    let filtered = logs || [];

    if (levelFilter !== "all") {
      filtered = filtered.filter((log) => log.level === levelFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((log) =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, levelFilter, searchQuery]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && !isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll, isPaused]);

  const handleRefresh = () => {
    refetch();
  };

  const handleClearLogs = () => {
    setFilteredLogs([]);
  };

  const handleExportLogs = () => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] ${log.source || ""}: ${log.message}`
      )
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `openclaw-logs-${new Date().toISOString()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelIcon = (level: string) => {
    const Icon = levelIcons[level as keyof typeof levelIcons] || Info;
    return <Icon className={`h-4 w-4 ${levelColors[level as keyof typeof levelColors]}`} />;
  };

  const stats = {
    total: logs?.length || 0,
    errors: logs?.filter((l) => l.level === "error").length || 0,
    warnings: logs?.filter((l) => l.level === "warn").length || 0,
    info: logs?.filter((l) => l.level === "info").length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Logs</h2>
          <p className="text-muted-foreground">
            Real-time gateway and agent logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Log entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.errors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Error messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warnings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Warning messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Info</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.info}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Info messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Viewer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Log Stream</CardTitle>
              <CardDescription>
                {loading
                  ? "Loading logs..."
                  : `Showing ${filteredLogs.length} of ${logs?.length || 0} logs`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>

              <Button variant="outline" size="sm" onClick={handleExportLogs}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearLogs}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div
              ref={scrollRef}
              className="p-4 font-mono text-sm space-y-1 bg-muted/30"
            >
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading logs...</p>
                </div>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const Icon = levelIcons[log.level as keyof typeof levelIcons] || Info;
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${levelColors[log.level as keyof typeof levelColors]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={levelBadges[log.level as keyof typeof levelBadges]} className="text-xs">
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          {log.source && (
                            <span className="text-xs text-muted-foreground">
                              [{log.source}]
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1 break-all">{log.message}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery || levelFilter !== "all"
                      ? "No logs match your filters"
                      : "No logs available"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Auto-scroll toggle */}
      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          id="autoScroll"
          checked={autoScroll}
          onChange={(e) => setAutoScroll(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="autoScroll">Auto-scroll to latest</label>
      </div>
    </div>
  );
}
