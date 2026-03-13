"use client";

import { useState } from "react";
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
  Globe,
  Bot,
  MessageSquare,
  Database,
  Shield,
  Palette,
  Server,
  Save,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
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

  const handleSave = () => {
    // Save settings
    console.log("Saving settings:", settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    // Reset to defaults
    setSettings({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure your OpenClaw Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <CheckCircle2 className="h-4 w-4" />
          Settings saved successfully
        </div>
      )}

      <Tabs defaultValue="gateway" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="gateway">Gateway</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="ui">Interface</TabsTrigger>
        </TabsList>

        {/* Gateway Settings */}
        <TabsContent value="gateway" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                <CardTitle>Gateway Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure your OpenClaw Gateway connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gatewayUrl">Gateway URL</Label>
                <Input
                  id="gatewayUrl"
                  value={settings.gatewayUrl}
                  onChange={(e) => setSettings({ ...settings, gatewayUrl: e.target.value })}
                  placeholder="http://127.0.0.1:18789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gatewayToken">Auth Token (Optional)</Label>
                <Input
                  id="gatewayToken"
                  type="password"
                  value={settings.gatewayToken}
                  onChange={(e) => setSettings({ ...settings, gatewayToken: e.target.value })}
                  placeholder="Enter your gateway token"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Reconnect</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically reconnect to gateway on disconnect
                  </p>
                </div>
                <Switch
                  checked={settings.autoReconnect}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoReconnect: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reconnectInterval">Reconnect Interval (ms)</Label>
                <Input
                  id="reconnectInterval"
                  type="number"
                  value={settings.reconnectInterval}
                  onChange={(e) => setSettings({ ...settings, reconnectInterval: parseInt(e.target.value) })}
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
                <CardTitle>Agent Defaults</CardTitle>
              </div>
              <CardDescription>
                Configure default agent behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultModel">Default Model</Label>
                <Select
                  value={settings.defaultModel}
                  onValueChange={(value) => value && setSettings({ ...settings, defaultModel: value })}
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
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (0-1)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxConcurrency">Max Concurrency</Label>
                <Input
                  id="maxConcurrency"
                  type="number"
                  value={settings.maxConcurrency}
                  onChange={(e) => setSettings({ ...settings, maxConcurrency: parseInt(e.target.value) })}
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
                <CardTitle>Channel Configuration</CardTitle>
              </div>
              <CardDescription>
                Manage communication channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Feishu Integration</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable Feishu enterprise messaging
                  </p>
                </div>
                <Switch
                  checked={settings.feishuEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, feishuEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>iMessage Integration</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable iMessage support
                  </p>
                </div>
                <Switch
                  checked={settings.imessageEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, imessageEnabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="channelPolicy">Default Channel Policy</Label>
                <Select
                  value={settings.defaultChannelPolicy}
                  onValueChange={(value) => value && setSettings({ ...settings, defaultChannelPolicy: value })}
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
                <CardTitle>Memory Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure LanceDB memory storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Memory</Label>
                  <p className="text-xs text-muted-foreground">
                    Store and retrieve agent memories
                  </p>
                </div>
                <Switch
                  checked={settings.memoryEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, memoryEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Capture</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically capture important information
                  </p>
                </div>
                <Switch
                  checked={settings.autoCapture}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoCapture: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Recall</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically retrieve relevant memories
                  </p>
                </div>
                <Switch
                  checked={settings.autoRecall}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoRecall: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="embeddingModel">Embedding Model</Label>
                <Select
                  value={settings.embeddingModel}
                  onValueChange={(value) => value && setSettings({ ...settings, embeddingModel: value })}
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
                <CardTitle>Interface Settings</CardTitle>
              </div>
              <CardDescription>
                Customize your dashboard appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => value && setSettings({ ...settings, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Refresh</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically refresh dashboard data
                  </p>
                </div>
                <Switch
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoRefresh: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="refreshInterval">Refresh Interval (ms)</Label>
                <Input
                  id="refreshInterval"
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
