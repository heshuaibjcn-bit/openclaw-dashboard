"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Database,
  Search,
  Sparkles,
  Clock,
  TrendingUp,
  Filter,
  RefreshCw,
  Edit,
  Save,
  X,
  Brain,
  Calendar,
  Bot,
  Home,
  MessageSquare,
} from "lucide-react";
import { useMemorySearch, useMemoryList } from "@/lib/openclaw";
import type { MemoryEntry } from "@/lib/openclaw/types";
import { getAllAgents } from "@/lib/openclaw/config-reader";

export default function MemoryPage() {
  const t = useTranslations('memory');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { data: searchResults, loading: searchLoading, search } = useMemorySearch();
  const { data: memories, loading: memoriesLoading, refetch, total, hasMore } = useMemoryList({ limit: 100 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [currentSearchResults, setCurrentSearchResults] = useState<MemoryEntry[]>([]);
  const [editingMemory, setEditingMemory] = useState<{ id: string; content: string } | null>(null);
  const [activeAgents, setActiveAgents] = useState<Array<{ id: string; name: string; capabilities?: string[] }>>([]);

  // Translate metadata types to display names
  const getMetadataTypeName = (type: string): string => {
    const typeMap: Record<string, { en: string; zh: string }> = {
      "preference": { en: "Preference", zh: "偏好" },
      "project": { en: "Project", zh: "项目" },
      "agent": { en: "Agent", zh: "代理" },
      "performance": { en: "Performance", zh: "性能" },
      "configuration": { en: "Configuration", zh: "配置" },
    };
    const localeKey = locale as 'en' | 'zh';
    return typeMap[type as keyof typeof typeMap]?.[localeKey] || type;
  };

  const getMetadataImportanceName = (importance: string): string => {
    const importanceMap: Record<string, { en: string; zh: string }> = {
      "high": { en: "High", zh: "高" },
      "medium": { en: "Medium", zh: "中" },
      "low": { en: "Low", zh: "低" },
    };
    const localeKey = locale as 'en' | 'zh';
    return importanceMap[importance as keyof typeof importanceMap]?.[localeKey] || importance;
  };

  useEffect(() => {
    // Load active agents from openclaw.json
    const agents = getAllAgents().filter(a => a.status === "active");
    setActiveAgents(agents);
  }, []);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await search(searchQuery, 20);
      setCurrentSearchResults(results);
    } else {
      setCurrentSearchResults([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleEditMemory = (memory: MemoryEntry) => {
    setEditingMemory({ id: memory.id, content: memory.content });
  };

  const handleSaveMemory = async () => {
    if (!editingMemory) return;

    try {
      const response = await fetch(`/api/memory/${editingMemory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editingMemory.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save memory');
      }

      setEditingMemory(null);
      await refetch();
    } catch (error) {
      console.error('Error saving memory:', error);
      alert(`Failed to save memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingMemory(null);
  };

  const getDisplayMemories = () => {
    let sourceMemories = searchQuery ? currentSearchResults : memories;

    // Filter by agent
    if (selectedAgent !== "all") {
      sourceMemories = sourceMemories.filter(m => m.metadata.agent === selectedAgent);
    }

    // Filter by tag
    if (selectedTag !== "all") {
      sourceMemories = sourceMemories.filter(m => m.metadata.type === selectedTag);
    }

    return sourceMemories;
  };

  const displayMemories = getDisplayMemories();

  const allTags = ["all", "preference", "project", "agent", "performance", "configuration"];

  const stats = {
    total: total,
    highImportance: memories.filter((m) => m.metadata.importance === "high").length,
    avgScore: memories.length > 0
      ? memories.reduce((sum, m) => sum + (m.score || 0), 0) / memories.length
      : 0,
    totalAgents: activeAgents.length,
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground";
    if (score >= 0.9) return "text-green-500";
    if (score >= 0.7) return "text-yellow-500";
    return "text-gray-500";
  };

  const getAgentName = (agentId: string) => {
    if (agentId === "main") return "Main";
    return activeAgents.find(a => a.id === agentId)?.name || agentId;
  };

  const getAgentIcon = (agentId: string) => {
    return agentId === "main" ? <Home className="h-3 w-3" /> : <Bot className="h-3 w-3" />;
  };

  const getRoleIcon = (role?: string) => {
    return role === "user" ? null : <MessageSquare className="h-3 w-3" />;
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
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={memoriesLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${memoriesLoading ? 'animate-spin' : ''}`} />
          {tCommon('refresh')}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalMemories')}</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('storedEntries')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('highImportance')}</CardTitle>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highImportance}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('importantMemories')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('avgScore')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.avgScore * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('relevanceScore')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeAgents')}</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('withMemory')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle>{t('searchMemory')}</CardTitle>
          <CardDescription>
            {t('searchThroughAgentMemory')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={!searchQuery.trim() || searchLoading}>
              {searchLoading ? tCommon('loading') : tCommon('search')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t('filter')}</span>
            <Select value={selectedAgent} onValueChange={(value) => value && setSelectedAgent(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('allAgentsOption')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allAgentsOption')}</SelectItem>
                <SelectItem value="main">{t('mainShared')}</SelectItem>
                {activeAgents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTag} onValueChange={(value) => value && setSelectedTag(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {t('showingMemories', { count: displayMemories.length })}
          </div>
        </div>
      </div>

      {/* Memory Editor */}
      {editingMemory && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{t('editingMemory')}: {editingMemory.id}</CardTitle>
                <CardDescription>
                  {t('changesWillBeWritten')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <X className="mr-2 h-4 w-4" />
                  {t('cancel')}
                </Button>
                <Button size="sm" onClick={handleSaveMemory}>
                  <Save className="mr-2 h-4 w-4" />
                  {t('save')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={editingMemory.content}
              onChange={(e) => setEditingMemory({ ...editingMemory, content: e.target.value })}
              className="min-h-[200px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      {/* Memory Entries */}
      <div className="grid gap-4">
        {memoriesLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">{tCommon('loading')}</p>
            </CardContent>
          </Card>
        ) : displayMemories.length > 0 ? (
          displayMemories.map((memory) => (
            <Card key={memory.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{memory.content}</p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getAgentIcon(memory.metadata.agent as string)}
                        <span>{getAgentName(memory.metadata.agent as string)}</span>
                      </div>

                      {getRoleIcon(memory.metadata.role as string)}

                      <Badge variant="outline" className="text-xs">
                        {getMetadataTypeName(String(memory.metadata.type))}
                      </Badge>

                      <Badge
                        variant={memory.metadata.importance === "high" ? "default" : "secondary"}
                        className={`text-xs ${memory.metadata.importance === "high" ? "bg-red-500 hover:bg-red-600" : ""}`}
                      >
                        {getMetadataImportanceName(String(memory.metadata.importance))}
                      </Badge>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(memory.createdAt).toLocaleString()}
                      </div>

                      {memory.score !== undefined && (
                        <div className="flex items-center gap-1 text-xs">
                          <Sparkles className={`h-3 w-3 ${getScoreColor(memory.score)}`} />
                          <span className={getScoreColor(memory.score)}>
                            {Math.round(memory.score * 100)}% {t('match')}
                          </span>
                        </div>
                      )}

                      {typeof memory.metadata.sessionId === 'string' && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Database className="h-3 w-3" />
                          <span className="font-mono">{memory.metadata.sessionId.substring(0, 8)}...</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata preview */}
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {Object.entries(memory.metadata).map(([key, value]) => (
                        key !== "type" && key !== "importance" && key !== "agent" && key !== "sessionId" && key !== "timestamp" && key !== "role" && (
                          <span key={key} className="bg-muted px-2 py-1 rounded">
                            {key}: {String(value)}
                          </span>
                        )
                      ))}
                    </div>
                  </div>

                  {!editingMemory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMemory(memory)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? t('noMemoriesMatchSearch') : t('noResults')}
              </p>
              {!searchQuery && selectedAgent !== "all" && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t('trySelectingAllAgents')}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Load More */}
      {hasMore && !searchQuery && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => refetch()}>
            {t('loadMore')}
          </Button>
        </div>
      )}

      {/* Memory Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('aboutMemory')}</CardTitle>
          <CardDescription>
            {t('aboutMemoryDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h4 className="font-medium">{t('semanticSearch')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('semanticSearchDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h4 className="font-medium">{t('persistentStorage')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('persistentStorageDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h4 className="font-medium">{t('agentSpecificMemory')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('agentSpecificMemoryDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                <h4 className="font-medium">{t('directEditing')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('directEditingDesc')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
