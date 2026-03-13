"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Search,
  TrendingUp,
  Clock,
  Bot,
  RefreshCw,
  Filter,
} from "lucide-react";
import { useSessions } from "@/lib/openclaw";
import type { Session } from "@/lib/openclaw";

export default function SessionsPage() {
  const t = useTranslations('sessions');
  const tCommon = useTranslations('common');
  const { data: sessions, loading, refetch } = useSessions();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions?.filter((session) =>
    session.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.model.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleRefresh = () => {
    refetch();
  };

  const getTokenUsagePercentage = (session: Session) => {
    return Math.round((session.tokens.total / session.tokens.max) * 100);
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
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {tCommon('refresh')}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.active')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('currentlyRunning')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalTokens')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions?.reduce((sum, s) => sum + s.tokens.total, 0).toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('acrossAllSessions')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('avgUsage')}</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions?.length
                ? Math.round(
                    sessions.reduce((sum, s) => sum + getTokenUsagePercentage(s), 0) /
                      sessions.length
                  )
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('tokenUtilization')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.avgDuration')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions && sessions.length > 0
                ? Math.floor(
                    (Date.now() - new Date(sessions[0].createdAt).getTime()) /
                      (1000 * 60 * 60)
                  ) + "h"
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Running duration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Sessions</CardTitle>
              <CardDescription>
                {loading
                  ? t('loading')
                  : `Showing ${filteredSessions.length} of ${sessions?.length || 0} sessions`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : filteredSessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Token Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-sm">
                      {session.id}
                    </TableCell>
                    <TableCell>{session.agentId}</TableCell>
                    <TableCell>{session.model}</TableCell>
                    <TableCell>
                      {new Date(session.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {Math.floor(
                        (Date.now() - new Date(session.lastActivity).getTime()) /
                          (1000 * 60)
                      )}{" "}
                      min ago
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-2 w-24">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${getTokenUsagePercentage(session)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getTokenUsagePercentage(session)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSession(session)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No sessions match your search"
                  : t('noSessions')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Detail Dialog */}
      <Dialog
        open={!!selectedSession}
        onOpenChange={() => setSelectedSession(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              {selectedSession?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Agent ID</p>
                  <p className="text-sm text-muted-foreground">{selectedSession.agentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Model</p>
                  <p className="text-sm text-muted-foreground">{selectedSession.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created At</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedSession.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Activity</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedSession.lastActivity).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Token Usage</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Input tokens</span>
                    <span>{selectedSession.tokens.input.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Output tokens</span>
                    <span>{selectedSession.tokens.output.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>
                      {selectedSession.tokens.total.toLocaleString()} /{" "}
                      {selectedSession.tokens.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${getTokenUsagePercentage(selectedSession)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {getTokenUsagePercentage(selectedSession)}% used
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Messages</p>
                {selectedSession.messages && selectedSession.messages.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedSession.messages.map((message) => (
                      <div
                        key={message.id}
                        className="rounded-lg border p-3 text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant={
                              message.role === "user"
                                ? "secondary"
                                : message.role === "assistant"
                                ? "default"
                                : "outline"
                            }
                          >
                            {message.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        {message.tokens && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {message.tokens} tokens
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No messages in this session yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
