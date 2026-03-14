"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Bot,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Code,
  MessageSquare,
  Edit,
  Trash2,
  Wrench,
  Zap,
  Database,
  FileText,
  Shield,
  CheckCircle2,
  Server,
  Cpu,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useAgents, useSkills } from "@/lib/openclaw";
import type { Agent } from "@/lib/openclaw";

interface ModelConfig {
  primaryModel: string;
  fallbackModels: string[];
  suggestedFallbacks: {
    current: string[];
    recommended: string[];
    reason: string;
  };
  providers: Array<{
    id: string;
    name: string;
    baseUrl: string;
    models: Array<{
      id: string;
      name: string;
      reasoning: boolean;
      cost: { input: number; output: number };
      contextWindow: number;
      maxTokens: number;
    }>;
    isPrimary: boolean;
    isFallback: boolean;
    authProfile: string;
  }>;
  cooldownConfig: {
    billingBackoffHours: number;
    billingMaxHours: number;
    failureWindowHours: number;
  };
  configPath: string;
}

export default function AgentsPage() {
  const t = useTranslations('agents');
  const tCommon = useTranslations('common');
  const { data: agents, loading, refetch } = useAgents();
  const { data: skills, loading: skillsLoading, extensions } = useSkills();
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [editingAgent, setEditingAgent] = useState({
    name: "",
    model: "",
    capabilities: [] as string[],
  });
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [modelConfigLoading, setModelConfigLoading] = useState(true);

  // Fetch model configuration
  useEffect(() => {
    fetchModelConfig();
  }, []);

  const fetchModelConfig = async () => {
    try {
      setModelConfigLoading(true);
      const response = await fetch('/api/models');
      if (response.ok) {
        const config = await response.json();
        setModelConfig(config);
      }
    } catch (error) {
      console.error('Failed to fetch model config:', error);
    } finally {
      setModelConfigLoading(false);
    }
  };

  const filteredAgents = agents?.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.model.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleRefresh = () => {
    refetch();
  };

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditingAgent({
      name: agent.name,
      model: agent.model,
      capabilities: [...agent.capabilities],
    });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving agent:", editingAgent);
    setEditDialogOpen(false);
    setSelectedAgent(null);
  };

  const handleDelete = (agent: Agent) => {
    // TODO: Implement delete functionality
    console.log("Deleting agent:", agent);
  };

  const toggleCapability = (cap: string) => {
    setEditingAgent((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter((c) => c !== cap)
        : [...prev.capabilities, cap],
    }));
  };

  const capabilityOptions = [
    { value: "chat", label: "Chat", icon: MessageSquare },
    { value: "code", label: "Code", icon: Code },
    { value: "tools", label: "Tools", icon: Settings },
    { value: "reasoning", label: "Reasoning", icon: Sparkles },
  ];

  const modelOptions = [
    "zai/glm-5",
    "zai/glm-4.7",
    "zai/glm-4.7-flash",
    "zai/glm-4.7-flashx",
  ];

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
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {tCommon('refresh')}
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {tCommon('create')} {t('title')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.totalDesc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.active')}</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents?.filter((a) => a.status === "active").length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.activeDesc')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.capabilities')}</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(agents?.flatMap((a) => a.capabilities)).size || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stats.capabilitiesDesc')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Model Disaster Recovery Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Model Disaster Recovery
              </CardTitle>
              <CardDescription className="mt-1">
                OpenClaw model failover and redundancy configuration
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {modelConfig?.providers.length || 0} Providers
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {modelConfigLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : modelConfig ? (
            <div className="space-y-6">
              {/* Primary and Fallback Models */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Primary Model
                </div>
                <div className="pl-6">
                  <Badge variant="default" className="text-sm">
                    {modelConfig.primaryModel}
                  </Badge>
                </div>

                {modelConfig.fallbackModels.length > 0 || modelConfig.suggestedFallbacks.recommended.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Server className="h-4 w-4 text-orange-500" />
                      Fallback Models
                    </div>

                    {/* Current Fallbacks */}
                    {modelConfig.suggestedFallbacks.current.length > 0 && (
                      <div className="pl-6 space-y-2">
                        <div className="text-xs text-muted-foreground">Current Configuration:</div>
                        <div className="flex flex-wrap gap-2">
                          {modelConfig.suggestedFallbacks.current.map((model, index) => (
                            <Badge key={model} variant="outline" className="text-xs">
                              {index + 1}. {model}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Fallbacks */}
                    {modelConfig.suggestedFallbacks.recommended.length > 0 && (
                      <div className="pl-6 space-y-2">
                        <div className="text-xs text-muted-foreground">Recommended Configuration:</div>
                        <div className="flex flex-wrap gap-2">
                          {modelConfig.suggestedFallbacks.recommended.map((model, index) => {
                            const isCurrent = modelConfig.suggestedFallbacks.current.includes(model);
                            return (
                              <Badge
                                key={model}
                                variant={isCurrent ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {index + 1}. {model}
                                {!isCurrent && index < modelConfig.suggestedFallbacks.current.length && (
                                  <span className="ml-1 text-yellow-500">*</span>
                                )}
                              </Badge>
                            );
                          })}
                        </div>
                        {modelConfig.suggestedFallbacks.reason && (
                          <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                            💡 {modelConfig.suggestedFallbacks.reason}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : null}
              </div>

              {/* Providers List */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Database className="h-4 w-4 text-blue-500" />
                  Model Providers
                </div>
                <div className="space-y-3">
                  {modelConfig.providers.map((provider) => (
                    <div key={provider.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{provider.name}</span>
                        </div>
                        <div className="flex gap-1">
                          {provider.isPrimary && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                          {provider.isFallback && (
                            <Badge variant="outline" className="text-xs">Fallback</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Base URL: <code className="bg-muted px-1 py-0.5 rounded">{provider.baseUrl}</code></div>
                        <div>Auth Profile: <code className="bg-muted px-1 py-0.5 rounded">{provider.authProfile}</code></div>
                        <div>Models: {provider.models.length} available</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooldown Configuration */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Failure Cooldown Settings
                </div>
                <div className="grid grid-cols-3 gap-4 pl-6">
                  <div>
                    <div className="text-xs text-muted-foreground">Billing Backoff</div>
                    <div className="text-sm font-medium">{modelConfig.cooldownConfig.billingBackoffHours}h</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Max Backoff</div>
                    <div className="text-sm font-medium">{modelConfig.cooldownConfig.billingMaxHours}h</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Failure Window</div>
                    <div className="text-sm font-medium">{modelConfig.cooldownConfig.failureWindowHours}h</div>
                  </div>
                </div>
              </div>

              {/* Configuration File Path */}
              <div className="pt-3 border-t">
                <div className="text-xs text-muted-foreground">
                  Configuration: <code className="bg-muted px-1 py-0.5 rounded">{modelConfig.configPath}</code>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Failed to load model configuration</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                {t('availableSkills')}
              </CardTitle>
              <CardDescription>
                {skillsLoading ? t('loading') : t('skillsDescription', { count: skills.length, extensions: extensions.length })}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className={`mr-2 h-4 w-4 ${skillsLoading ? 'animate-spin' : ''}`} />
              {tCommon('refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {skillsLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : skills.length > 0 ? (
            <div className="space-y-6">
              {/* Group skills by extension */}
              {extensions.map((ext) => {
                const extSkills = skills.filter((s) => s.extension === ext);
                if (extSkills.length === 0) return null;

                // Get extension icon based on type
                const getExtIcon = (extension: string) => {
                  switch (extension) {
                    case 'feishu': return <MessageSquare className="h-4 w-4" />;
                    case 'memory-lancedb-pro': return <Database className="h-4 w-4" />;
                    case 'openai': return <Sparkles className="h-4 w-4" />;
                    default: return <Zap className="h-4 w-4" />;
                  }
                };

                return (
                  <div key={ext} className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getExtIcon(ext)}
                      <h4 className="text-sm font-semibold capitalize">{ext}</h4>
                      <Badge variant="outline" className="text-xs">
                        {extSkills.length} {t('skills')}
                      </Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {extSkills.map((skill) => {
                        const getCategoryIcon = (category: string) => {
                          switch (category) {
                            case 'Documents': return <FileText className="h-3 w-3" />;
                            case 'Knowledge': return <Database className="h-3 w-3" />;
                            case 'Memory': return <Database className="h-3 w-3" />;
                            case 'Communication': return <MessageSquare className="h-3 w-3" />;
                            default: return <Zap className="h-3 w-3" />;
                          }
                        };

                        return (
                          <div
                            key={skill.id}
                            className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                              {getCategoryIcon(skill.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{skill.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{skill.description}</p>
                              {skill.tools && skill.tools.length > 0 && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {skill.tools.slice(0, 3).map((tool: string) => (
                                    <Badge key={tool} variant="outline" className="text-xs">
                                      {tool}
                                    </Badge>
                                  ))}
                                  {skill.tools.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{skill.tools.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noSkills')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('noSkillsDesc')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agents Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('allAgents')}</CardTitle>
              <CardDescription>
                {loading
                  ? t('loading')
                  : t('showing', { count: filteredAgents.length, total: agents?.length || 0 })}
              </CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : filteredAgents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {agent.id}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={agent.status === "active" ? "default" : "secondary"}
                        className={agent.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Model</p>
                      <p className="text-sm font-medium">{agent.model}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Capabilities</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.map((cap: string) => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('created')}</p>
                      <p className="text-xs">
                        {new Date(agent.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(agent)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        {t('edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(agent)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        {t('delete')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? t('noAgentsMatchSearch')
                  : t('noAgentsConfigured')}
              </p>
              {!searchQuery && (
                <Button className="mt-4" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createYourFirstAgent')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Agent Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAgent ? t('editAgent') : t('createAgent')}
            </DialogTitle>
            <DialogDescription>
              {selectedAgent ? t('editAgentDesc') : t('createAgentDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{tCommon('name')}</Label>
              <Input
                id="name"
                value={editingAgent.name}
                onChange={(e) =>
                  setEditingAgent({ ...editingAgent, name: e.target.value })
                }
                placeholder={t('namePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">{t('model')}</Label>
              <Select
                value={editingAgent.model}
                onValueChange={(value) =>
                  value && setEditingAgent({ ...editingAgent, model: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectModel')} />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('capabilities')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {capabilityOptions.map((cap) => {
                  const Icon = cap.icon;
                  const isSelected = editingAgent.capabilities.includes(cap.value);
                  return (
                    <button
                      key={cap.value}
                      type="button"
                      onClick={() => toggleCapability(cap.value)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{cap.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleSave}>
              {selectedAgent ? t('saveChanges') : t('createAgent')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
