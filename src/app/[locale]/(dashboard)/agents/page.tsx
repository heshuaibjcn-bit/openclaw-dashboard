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
  Bot,
} from "lucide-react";
import { useAgents, useSkills } from "@/lib/openclaw";
import type { Agent } from "@/lib/openclaw";

const ArrowDown = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 1L6 11M6 11L3 8M6 11L9 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
  const { data: skills, loading: skillsLoading, extensions, refetch: refetchSkills } = useSkills();
  const [searchQuery, setSearchQuery] = useState("");
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
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
    } catch {
      console.error('Failed to fetch model config');
    } finally {
      setModelConfigLoading(false);
    }
  };

  const filteredAgents = agents?.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.model.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Filter skills by search query
  const filteredSkills = skills?.filter((skill) => {
    if (!skillSearchQuery) return true;
    const query = skillSearchQuery.toLowerCase();
    return (
      skill.name.toLowerCase().includes(query) ||
      (skill.description?.toLowerCase().includes(query) ?? false) ||
      (skill.category?.toLowerCase().includes(query) ?? false) ||
      (skill.extension?.toLowerCase().includes(query) ?? false) ||
      skill.tools?.some((tool: string) => tool.toLowerCase().includes(query))
    );
  }) || [];

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

  const handleView = (agent: Agent) => {
    setSelectedAgent(agent);
    setViewDialogOpen(true);
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

  const renderFlowchart = (config: ModelConfig) => {
    const models = [
      { id: config.primaryModel, type: 'primary', configured: true },
      ...config.suggestedFallbacks.recommended.map((m) => ({
        id: m,
        type: 'fallback',
        configured: config.suggestedFallbacks.current.includes(m),
      })),
    ];

    return (
      <div className="w-full max-w-md mx-auto">
        {/* Flow Nodes */}
        <div className="space-y-0">
          {models.map((model, index) => (
            <div key={model.id} className="relative">
              {/* Model Node */}
              <div
                className={`
                  mx-auto px-4 py-3 rounded-lg border-2 text-center text-sm font-medium relative
                  ${model.type === 'primary'
                    ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-500 dark:text-green-400 w-64'
                    : model.configured
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400 w-64'
                    : 'bg-gray-50 border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 w-64'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  {model.type === 'primary' && <CheckCircle2 className="h-3 w-3 flex-shrink-0" />}
                  {model.type === 'fallback' && !model.configured && <span className="text-yellow-500 flex-shrink-0">*</span>}
                  <span className="truncate">{model.id}</span>
                </div>
              </div>

              {/* Arrow and Label */}
              {index < models.length - 1 && (
                <div className="flex flex-col items-center justify-center py-2">
                  <ArrowDown className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                    {index === 0 ? 'Fail' : index === models.length - 2 ? 'Cross-Provider' : 'Downgrade'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cooldown Info */}
        <div className="mt-4 pt-3 border-t border-dashed border-border">
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Cooldown: {config.cooldownConfig.billingBackoffHours}h backoff, {config.cooldownConfig.failureWindowHours}h failure window</span>
          </div>
        </div>
      </div>
    );
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
                        <div className="text-xs text-muted-foreground">{t('recommendedConfiguration')}:</div>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  {t('availableSkills')}
                </CardTitle>
                <CardDescription>
                  {skillsLoading ? t('loading') : t('skillsDescription', { count: filteredSkills.length, extensions: extensions.length })}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchSkills()}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${skillsLoading ? 'animate-spin' : ''}`} />
                {tCommon('refresh')}
              </Button>
            </div>

            {/* Skill Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('skillSearchPlaceholder')}
                value={skillSearchQuery}
                onChange={(e) => setSkillSearchQuery(e.target.value)}
                className="pl-9 w-full"
                disabled={skillsLoading}
              />
              {skillSearchQuery && (
                <button
                  onClick={() => setSkillSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {skillsLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : filteredSkills.length > 0 ? (
            <div className="space-y-6">
              {/* Show search result info */}
              {skillSearchQuery && (
                <div className="text-sm text-muted-foreground">
                  Found {filteredSkills.length} of {skills.length} skills matching &ldquo;{skillSearchQuery}&rdquo;
                </div>
              )}

              {/* Group skills by category */}
              {Object.entries(
                filteredSkills.reduce((acc: Record<string, typeof filteredSkills>, skill) => {
                  const category = skill.category || 'Other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(skill);
                  return acc;
                }, {})
              ).map(([category, categorySkills]) => {
                const getCategoryIcon = (category: string) => {
                  switch (category) {
                    case 'Documents': return <FileText className="h-4 w-4" />;
                    case 'Knowledge': return <Database className="h-4 w-4" />;
                    case 'Memory': return <Database className="h-4 w-4" />;
                    case 'Communication': return <MessageSquare className="h-4 w-4" />;
                    case 'Admin': return <Shield className="h-4 w-4" />;
                    case 'Data': return <Database className="h-4 w-4" />;
                    case 'Storage': return <Database className="h-4 w-4" />;
                    case 'Native Skill': return <Sparkles className="h-4 w-4" />;
                    case 'Workspace Skill': return <Wrench className="h-4 w-4" />;
                    default: return <Zap className="h-4 w-4" />;
                  }
                };

                const getCategoryColor = (category: string) => {
                  switch (category) {
                    case 'Documents': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
                    case 'Knowledge': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
                    case 'Memory': return 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20';
                    case 'Communication': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
                    case 'Admin': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
                    case 'Data': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
                    case 'Storage': return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20';
                    case 'Native Skill': return 'text-pink-500 bg-pink-50 dark:bg-pink-900/20';
                    case 'Workspace Skill': return 'text-teal-500 bg-teal-50 dark:bg-teal-900/20';
                    default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
                  }
                };

                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded ${getCategoryColor(category)}`}>
                        {getCategoryIcon(category)}
                      </div>
                      <h4 className="text-sm font-semibold">{category}</h4>
                      <Badge variant="outline" className="text-xs">
                        {categorySkills.length} {t('skills')}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {categorySkills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                              <Zap className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{skill.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{skill.description || ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {skill.extension && (
                              <Badge variant="outline" className="text-xs">
                                {skill.extension}
                              </Badge>
                            )}
                            {skill.tools && skill.tools.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {skill.tools.length} tools
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {skillSearchQuery ? (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No skills found matching &ldquo;{skillSearchQuery}&rdquo;</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSkillSearchQuery('')}
                  >
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('noSkills')}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('noSkillsDesc')}
                  </p>
                </>
              )}
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
                        className={
                          agent.status === "active"
                            ? "bg-green-500 hover:bg-green-600"
                            : agent.status === "inactive"
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }
                      >
                        {agent.status === "active"
                          ? t('status.running')
                          : agent.status === "inactive"
                          ? t('status.idle')
                          : t('status.error')}
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
                        onClick={() => handleView(agent)}
                      >
                        {t('view')}
                      </Button>
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

      {/* View Agent Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {selectedAgent?.name}
            </DialogTitle>
            <DialogDescription>
              Agent details and disaster recovery configuration
            </DialogDescription>
          </DialogHeader>

          {selectedAgent && (
            <div className="space-y-6">
              {/* Agent Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Model</Label>
                  <p className="text-sm font-medium">{selectedAgent.model}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Badge variant={
                    selectedAgent.status === "active" ? "default" :
                    selectedAgent.status === "inactive" ? "secondary" : "destructive"
                  }>
                    {selectedAgent.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Created</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedAgent.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Capabilities</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedAgent.capabilities.map((cap) => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Disaster Recovery Configuration */}
              {modelConfig && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-500" />
                    Model Disaster Recovery
                  </h3>

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

                    {/* Disaster Recovery Flowchart */}
                    <div className="mt-4 p-4 border rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                      <div className="flex items-center gap-2 text-sm font-medium mb-4">
                        <Shield className="h-4 w-4 text-purple-500" />
                        Disaster Recovery Flow
                      </div>
                      <div className="flex flex-col items-center">
                        {renderFlowchart(modelConfig)}
                      </div>
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
                            <div className="text-xs text-muted-foreground">{t('recommendedConfiguration')}:</div>
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
                    ) : (
                      <div className="text-sm text-muted-foreground pl-6">
                        No fallback models configured
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>
              {tCommon('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
