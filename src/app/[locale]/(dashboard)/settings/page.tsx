"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Bot,
  MessageSquare,
  Database,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Palette,
  Server,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  XCircle,
  CheckCircle,
  TrendingUp,
  Brain,
  Plug,
} from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const [saved, setSaved] = useState(false);

  // OpenClaw version state
  const [openclawVersion, setOpenclawVersion] = useState<{
    localVersion: string | null;
    latestVersion: string | null;
    hasUpdate: boolean | null;
    loading: boolean;
    error: string | null;
  }>({
    localVersion: null,
    latestVersion: null,
    hasUpdate: null,
    loading: true,
    error: null,
  });

  const [appSettings, setSettings] = useState({
    // Security
    readonlyMode: true,
    localTokenAuth: true,
    approvalActionsEnabled: false,
    approvalActionsDryRun: true,
    importMutationEnabled: false,
    importMutationDryRun: false,

    // Gateway
    gatewayUrl: "http://127.0.0.1:18789",
    gatewayToken: "",
    autoReconnect: true,
    reconnectInterval: 3000,

    // Agent
    defaultModel: "zai/glm-5",
    maxTokens: 204800,
    temperature: 0.7,
    maxConcurrency: 4,

    // Channels
    feishuEnabled: true,
    imessageEnabled: true,
    defaultChannelPolicy: "allowlist",

    // Memory
    memoryEnabled: true,
    autoCapture: true,
    autoRecall: true,
    embeddingModel: "jina-embeddings-v3",

    // UI
    theme: "system",
    autoRefresh: true,
    refreshInterval: 30000,
  });

  // Load OpenClaw version information
  useEffect(() => {
    const loadVersionInfo = async () => {
      try {
        setOpenclawVersion(prev => ({ ...prev, loading: true }));

        // Fetch update check
        const response = await fetch('/api/openclaw/check-update');
        if (response.ok) {
          const data = await response.json();
          setOpenclawVersion({
            localVersion: data.localVersion,
            latestVersion: data.latestVersion,
            hasUpdate: data.hasUpdate,
            loading: false,
            error: null,
          });
        } else {
          throw new Error('Failed to fetch version info');
        }
      } catch (error) {
        console.error('Error loading version info:', error);
        setOpenclawVersion(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load version info',
        }));
      }
    };

    loadVersionInfo();
  }, []);

  // Calculate connector status based on security settings
  const connectorStatus = useMemo(() => ({
    gateway: { status: "connected" as "connected" | "disconnected" | "degraded", latency: 45 },
    runtime: { status: appSettings.readonlyMode ? "connected" as "connected" | "disconnected" | "degraded" : "disconnected", files: 6 },
    subscription: { status: "partial" as "connected" | "disconnected" | "partial" },
    memory: { status: "connected" as "connected" | "disconnected" | "degraded", type: "LanceDB" },
  }), [appSettings.readonlyMode]);

  const handleSave = () => {
    // Save settings
    console.log("Saving settings:", appSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    // Reset to defaults
    setSettings({
      readonlyMode: true,
      localTokenAuth: true,
      approvalActionsEnabled: false,
      approvalActionsDryRun: true,
      importMutationEnabled: false,
      importMutationDryRun: false,
      gatewayUrl: "http://127.0.0.1:18789",
      gatewayToken: "",
      autoReconnect: true,
      reconnectInterval: 3000,
      defaultModel: "zai/glm-5",
      maxTokens: 204800,
      temperature: 0.7,
      maxConcurrency: 4,
      feishuEnabled: true,
      imessageEnabled: true,
      defaultChannelPolicy: "allowlist",
      memoryEnabled: true,
      autoCapture: true,
      autoRecall: true,
      embeddingModel: "jina-embeddings-v3",
      theme: "system",
      autoRefresh: true,
      refreshInterval: 30000,
    });
  };

  const getConnectorBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />{t('connected')}</Badge>;
      case "disconnected":
        return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" />{t('notConnected')}</Badge>;
      case "degraded":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500"><AlertTriangle className="mr-1 h-3 w-3" />{t('degraded')}</Badge>;
      case "partial":
        return <Badge variant="outline" className="border-blue-500 text-blue-500"><Plug className="mr-1 h-3 w-3" />{t('partial')}</Badge>;
      default:
        return <Badge variant="secondary">{t('unknown')}</Badge>;
    }
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
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {tCommon('refresh')}
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            {tCommon('save')}
          </Button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <CheckCircle2 className="h-4 w-4" />
          {t('settingsSaved')}
        </div>
      )}

      {/* Connector Status Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            <CardTitle>{t('connectorStatus')}</CardTitle>
          </div>
          <CardDescription>
            {t('connectorStatusDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Server className="h-4 w-4" />
                  <span className="font-medium">{t('gateway')}</span>
                </div>
                {getConnectorBadge(connectorStatus.gateway.status)}
              </div>
              {connectorStatus.gateway.status === "connected" && (
                <p className="text-xs text-muted-foreground">
                  {t('latency')} {connectorStatus.gateway.latency}ms
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4" />
                  <span className="font-medium">{t('runtimeData')}</span>
                </div>
                {getConnectorBadge(connectorStatus.runtime.status)}
              </div>
              {connectorStatus.runtime.status === "connected" && (
                <p className="text-xs text-muted-foreground">
                  {connectorStatus.runtime.files} {t('filesLoaded')}
                </p>
              )}
            </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">{t('subscription')}</span>
                  </div>
                  {getConnectorBadge(connectorStatus.subscription.status)}
                </div>
                {connectorStatus.subscription.status === "partial" && (
                  <p className="text-xs text-muted-foreground">
                    {t('bestEffortMode')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">{t('memory')} ({connectorStatus.memory.type})</span>
                  </div>
                  {getConnectorBadge(connectorStatus.memory.status)}
                </div>
                {connectorStatus.memory.status === "connected" && (
                  <p className="text-xs text-muted-foreground">
                    {t('vectorSearchActive')}
                  </p>
                )}
              </div>
          </div>
        </CardContent>
      </Card>

      {/* OpenClaw Version Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <CardTitle>{t('openclawVersion')}</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://github.com/heshuaibjcn-bit/openclaw/releases', '_blank')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              {t('viewReleases')}
            </Button>
          </div>
          <CardDescription>
            {t('openclawVersionDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {openclawVersion.loading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : openclawVersion.error ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              {openclawVersion.error}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('currentVersion')}</p>
                  <p className="text-2xl font-bold">{openclawVersion.localVersion || '-'}</p>
                </div>
                {openclawVersion.hasUpdate && (
                  <Badge variant="default" className="bg-green-500 animate-pulse">
                    {t('updateAvailable')}
                  </Badge>
                )}
              </div>

              {openclawVersion.latestVersion && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{t('latestVersion')}:</span>
                  <span className="font-medium">{openclawVersion.latestVersion}</span>
                </div>
              )}

              {openclawVersion.hasUpdate && openclawVersion.localVersion && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                          {t('newVersionAvailable')}
                        </h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                          {t('updateAvailableMessage', {
                            current: openclawVersion.localVersion || '-',
                            latest: openclawVersion.latestVersion || '-',
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('https://github.com/heshuaibjcn-bit/openclaw/releases/latest', '_blank')}
                        >
                          {t('viewReleaseNotes')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => window.open('https://github.com/heshuaibjcn-bit/openclaw#upgrade', '_blank')}
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          {t('upgradeNow')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!openclawVersion.hasUpdate && (
                <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20 p-4">
                  <div className="flex items-center gap-2 text-sm text-green-900 dark:text-green-100">
                    <CheckCircle className="h-4 w-4" />
                    {t('upToDate')}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="security" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="security">{t('security')}</TabsTrigger>
          <TabsTrigger value="gateway">{t('gatewayTab')}</TabsTrigger>
          <TabsTrigger value="agents">{t('agents')}</TabsTrigger>
          <TabsTrigger value="channels">{t('channelsTab')}</TabsTrigger>
          <TabsTrigger value="memory">{t('memoryTab')}</TabsTrigger>
          <TabsTrigger value="ui">{t('interface')}</TabsTrigger>
        </TabsList>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>{t('securityMode')}</CardTitle>
              </div>
              <CardDescription>
                {t('securityModeDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {appSettings.readonlyMode ? (
                      <Lock className="h-4 w-4 text-green-500" />
                    ) : (
                      <Unlock className="h-4 w-4 text-orange-500" />
                    )}
                    <Label className="font-medium">{t('readOnlyMode')}</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {appSettings.readonlyMode
                      ? t('readOnlyModeEnabled')
                      : t('readOnlyModeDisabled')}
                  </p>
                </div>
                <Switch
                  checked={appSettings.readonlyMode}
                  onCheckedChange={(checked) => setSettings({ ...appSettings, readonlyMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    <Label className="font-medium">{t('localTokenAuth')}</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('localTokenAuthDesc')}
                  </p>
                </div>
                <Switch
                  checked={appSettings.localTokenAuth}
                  onCheckedChange={(checked) => setSettings({ ...appSettings, localTokenAuth: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                <CardTitle>{t('approvalActions')}</CardTitle>
              </div>
              <CardDescription>
                {t('approvalWorkflowControl')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{t('enableApprovalActions')}</Label>
                      <Badge variant={appSettings.approvalActionsEnabled ? "destructive" : "secondary"}>
                        {appSettings.approvalActionsEnabled ? tCommon('enabled') : tCommon('disabled')}
                      </Badge>
                    </div>
                    <Switch
                      checked={appSettings.approvalActionsEnabled}
                      onCheckedChange={(checked) => setSettings({ ...appSettings, approvalActionsEnabled: checked })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {appSettings.approvalActionsEnabled ? tCommon('approvalWorkflowActive') : tCommon('approvalWorkflowDisabled')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{t('dryRunMode')}</Label>
                      <Badge variant={appSettings.approvalActionsDryRun ? "outline" : "default"}>
                        {appSettings.approvalActionsDryRun ? tCommon('dryRunShort') : tCommon('live')}
                      </Badge>
                    </div>
                    <Switch
                      checked={appSettings.approvalActionsDryRun}
                      onCheckedChange={(checked) => setSettings({ ...appSettings, approvalActionsDryRun: checked })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {appSettings.approvalActionsDryRun
                      ? t('dryRunModeEnabled')
                      : t('dryRunModeDisabled')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>{t('importExportMutations')}</CardTitle>
              </div>
              <CardDescription>
                {t('importExportControl')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{t('enableImportMutations')}</Label>
                      <Badge variant={appSettings.importMutationEnabled ? "destructive" : "secondary"}>
                        {appSettings.importMutationEnabled ? tCommon('enabled') : tCommon('disabled')}
                      </Badge>
                    </div>
                    <Switch
                      checked={appSettings.importMutationEnabled}
                      onCheckedChange={(checked) => setSettings({ ...appSettings, importMutationEnabled: checked })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {appSettings.importMutationEnabled
                      ? t('importEnabled')
                      : t('importDisabled')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{t('dryRunImports')}</Label>
                      <Badge variant={appSettings.importMutationDryRun ? "outline" : "default"}>
                        {appSettings.importMutationDryRun ? tCommon('dryRunShort') : tCommon('live')}
                      </Badge>
                    </div>
                    <Switch
                      checked={appSettings.importMutationDryRun}
                      onCheckedChange={(checked) => setSettings({ ...appSettings, importMutationDryRun: checked })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {appSettings.importMutationDryRun
                      ? t('importDryRunEnabled')
                      : t('importDryRunDisabled')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gateway Settings */}
        <TabsContent value="gateway" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                <CardTitle>{t('gatewayConfiguration')}</CardTitle>
              </div>
              <CardDescription>
                {t('configureGatewayConnection')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gatewayUrl">{t('gatewayUrl')}</Label>
                <Input
                  id="gatewayUrl"
                  value={appSettings.gatewayUrl}
                  onChange={(e) => setSettings({ ...appSettings, gatewayUrl: e.target.value })}
                  placeholder={t('gatewayUrlPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gatewayToken">{t('authToken')}</Label>
                <Input
                  id="gatewayToken"
                  type="password"
                  value={appSettings.gatewayToken}
                  onChange={(e) => setSettings({ ...appSettings, gatewayToken: e.target.value })}
                  placeholder={t('authTokenPlaceholder')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('autoReconnect')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('automaticallyReconnect')}
                  </p>
                </div>
                <Switch
                  checked={appSettings.autoReconnect}
                  onCheckedChange={(checked) => setSettings({ ...appSettings, autoReconnect: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reconnectInterval">{t('reconnectInterval')}</Label>
                <Input
                  id="reconnectInterval"
                  type="number"
                  value={appSettings.reconnectInterval}
                  onChange={(e) => setSettings({ ...appSettings, reconnectInterval: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Settings */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <CardTitle>{t('agentDefaults')}</CardTitle>
              </div>
              <CardDescription>
                {t('configureAgentBehavior')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultModel">{t('defaultModel')}</Label>
                <Select
                  value={appSettings.defaultModel}
                  onValueChange={(value) => value && setSettings({ ...appSettings, defaultModel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zai/glm-5">GLM-5</SelectItem>
                    <SelectItem value="zai/glm-4.7">GLM-4.7</SelectItem>
                    <SelectItem value="zai/glm-4.7-flash">GLM-4.7 Flash</SelectItem>
                    <SelectItem value="zai/glm-4.7-flashx">GLM-4.7 FlashX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">{t('maxTokens')}</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={appSettings.maxTokens}
                  onChange={(e) => setSettings({ ...appSettings, maxTokens: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">{t('temperature')}</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={appSettings.temperature}
                  onChange={(e) => setSettings({ ...appSettings, temperature: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxConcurrency">{t('maxConcurrency')}</Label>
                <Input
                  id="maxConcurrency"
                  type="number"
                  value={appSettings.maxConcurrency}
                  onChange={(e) => setSettings({ ...appSettings, maxConcurrency: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channel Settings */}
        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>{t('channelConfiguration')}</CardTitle>
              </div>
              <CardDescription>
                {t('manageChannels')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('feishuIntegration')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('enableFeishuMessaging')}
                  </p>
                </div>
                <Switch
                  checked={appSettings.feishuEnabled}
                  onCheckedChange={(checked) => setSettings({ ...appSettings, feishuEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('imessageIntegration')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('enableImessageSupport')}
                  </p>
                </div>
                <Switch
                  checked={appSettings.imessageEnabled}
                  onCheckedChange={(checked) => setSettings({ ...appSettings, imessageEnabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="channelPolicy">{t('defaultChannelPolicy')}</Label>
                <Select
                  value={appSettings.defaultChannelPolicy}
                  onValueChange={(value) => value && setSettings({ ...appSettings, defaultChannelPolicy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allowlist">Allowlist</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memory Settings */}
        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>{t('memoryConfiguration')}</CardTitle>
              </div>
              <CardDescription>
                {t('configureLanceDBStorage')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('enableMemory')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('enableMemoryStore')}
                  </p>
                </div>
                <Switch
                  checked={appSettings.memoryEnabled}
                  onCheckedChange={(checked) => setSettings({ ...appSettings, memoryEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('autoCapture')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('autoCaptureInfo')}
                  </p>
                </div>
                <Switch
                  checked={appSettings.autoCapture}
                  onCheckedChange={(checked) => setSettings({ ...appSettings, autoCapture: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('autoRecall')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('autoRecallInfo')}
                  </p>
                </div>
                <Switch
                  checked={appSettings.autoRecall}
                  onCheckedChange={(checked) => setSettings({ ...appSettings, autoRecall: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="embeddingModel">{t('embeddingModel')}</Label>
                <Select
                  value={appSettings.embeddingModel}
                  onValueChange={(value) => value && setSettings({ ...appSettings, embeddingModel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jina-embeddings-v3">Jina Embeddings v3</SelectItem>
                    <SelectItem value="openai-text-embedding-3">OpenAI Ada-003</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UI Settings */}
        <TabsContent value="ui" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>{t('interfaceSettings')}</CardTitle>
              </div>
              <CardDescription>
                {t('customizeDashboard')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">{t('theme')}</Label>
                <Select
                  value={appSettings.theme}
                  onValueChange={(value) => value && setSettings({ ...appSettings, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('light')}</SelectItem>
                    <SelectItem value="dark">{t('dark')}</SelectItem>
                    <SelectItem value="system">{t('system')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('autoRefresh')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('automaticallyRefreshData')}
                  </p>
                </div>
                <Switch
                  checked={appSettings.autoRefresh}
                  onCheckedChange={(checked) => setSettings({ ...appSettings, autoRefresh: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="refreshInterval">{t('refreshInterval')}</Label>
                <Input
                  id="refreshInterval"
                  type="number"
                  value={appSettings.refreshInterval}
                  onChange={(e) => setSettings({ ...appSettings, refreshInterval: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
