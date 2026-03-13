"use client";

import { useState } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Radio,
  MessageSquare,
  Smartphone,
  Mail,
  RefreshCw,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Clock,
} from "lucide-react";
import { useChannels } from "@/lib/openclaw";
import type { Channel } from "@/lib/openclaw";

const channelIcons = {
  imessage: Smartphone,
  feishu: MessageSquare,
  telegram: Send,
  discord: Radio,
  email: Mail,
};

export default function ChannelsPage() {
  const t = useTranslations('channels');
  const tCommon = useTranslations('common');
  const { data: channels, loading, refetch } = useChannels();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const locale = useLocale();

  const channelNames = {
    imessage: t('imessage'),
    feishu: t('feishu'),
    telegram: t('telegram'),
    discord: "Discord",
    email: tCommon('type') === 'email' ? 'Email' : 'Email',
  };

  const handleRefresh = () => {
    refetch();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "disconnected":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge variant="default">Connected</Badge>;
      case "disconnected":
        return <Badge variant="secondary">Disconnected</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: channels?.length || 0,
    connected: channels?.filter((c) => c.status === "connected").length || 0,
    enabled: channels?.filter((c) => c.enabled).length || 0,
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
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('configured')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tCommon('connected')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.connected}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('activeConnections')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tCommon('enabled')}</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enabled}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('activeChannels')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('successRate')}</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.connected / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('connectionRate')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Channels Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('allChannels')}</CardTitle>
          <CardDescription>
            {loading
              ? t('loading')
              : t('managingChannels', { count: channels?.length || 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : channels && channels.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Messages Today</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => {
                  const Icon = channelIcons[channel.type as keyof typeof channelIcons] || Radio;
                  return (
                    <TableRow key={channel.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">
                            {channelNames[channel.type as keyof typeof channelNames] || channel.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{channel.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(channel.status)}
                          {getStatusBadge(channel.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch checked={channel.enabled} disabled />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          5 min ago
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {channel.type === "imessage" ? "12" : channel.type === "feishu" ? "24" : "0"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedChannel(channel)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Radio className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noChannelsConfigured')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('addChannels')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channel Types */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base">{t('feishu')}</CardTitle>
            </div>
            <CardDescription>{t('feishuDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('status')}</span>
                {channels?.find((c) => c.type === "feishu")?.status === "connected" ? (
                  <Badge variant="default">{tCommon('connected')}</Badge>
                ) : (
                  <Badge variant="secondary">{t('notConnected')}</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('features')}</span>
                <span>{t('botWebhook')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">{t('imessage')}</CardTitle>
            </div>
            <CardDescription>{t('imessageDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('status')}</span>
                {channels?.find((c) => c.type === "imessage")?.status === "connected" ? (
                  <Badge variant="default">{tCommon('connected')}</Badge>
                ) : (
                  <Badge variant="secondary">{t('notConnected')}</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('features')}</span>
                <span>{t('dmGroups')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-base">{t('telegram')}</CardTitle>
            </div>
            <CardDescription>{t('telegramDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('status')}</span>
                <Badge variant="outline">{t('available')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('features')}</span>
                <span>{t('botChannels')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Detail Dialog */}
      <Dialog
        open={!!selectedChannel}
        onOpenChange={() => setSelectedChannel(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedChannel && channelNames[selectedChannel.type as keyof typeof channelNames]} Settings
            </DialogTitle>
            <DialogDescription>
              {t('configure')} {t('channelSettings')}
            </DialogDescription>
          </DialogHeader>
          {selectedChannel && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">{t('channelId')}</p>
                  <p className="text-sm text-muted-foreground">{selectedChannel.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('type')}</p>
                  <p className="text-sm text-muted-foreground">{selectedChannel.type}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">{t('status')}</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedChannel.status)}
                  <span>{selectedChannel.status}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">{t('enableChannel')}</p>
                <div className="flex items-center gap-2">
                  <Switch checked={selectedChannel.enabled} disabled />
                  <span className="text-sm text-muted-foreground">
                    {selectedChannel.enabled ? t('enabled') : t('disabled')}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {t('additionalConfig')}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
