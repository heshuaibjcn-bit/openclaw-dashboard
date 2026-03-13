"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  FileText,
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
} from "lucide-react";
import { useMemorySearch } from "@/lib/openclaw";
import type { MemoryEntry } from "@/lib/openclaw";
import { getAllAgents } from "@/lib/openclaw/config-reader";

export default function MemoryPage() {
  const t = useTranslations('memory');
  const tCommon = useTranslations('common');
  const { data: memories, loading, search } = useMemorySearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<MemoryEntry[]>([]);
  const [editingMemory, setEditingMemory] = useState<{ id: string; content: string } | null>(null);
  const [activeAgents, setActiveAgents] = useState<Array<{ id: string; name: string; capabilities?: string[] }>>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load active agents from openclaw.json
    const agents = getAllAgents().filter(a => a.status === "active");
    setActiveAgents(agents);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new memories arrive
    if (scrollRef.current && !editingMemory) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [memories, editingMemory]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await search(searchQuery, 20);
      setSearchResults(results);
    } else {
      setSearchResults([]);
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

  const handleSaveMemory = () => {
    if (!editingMemory) return;

    // TODO: Implement file write-back API
    console.log("Saving memory:", editingMemory.id, editingMemory.content);

    // Update the memory in the list
    setEditingMemory(null);
  };

  const handleCancelEdit = () => {
    setEditingMemory(null);
  };

  // Mock memory data organized by agent
  const mockMemoriesByAgent: Record<string, MemoryEntry[]> = {
    main: [
      {
        id: "1",
        content: "User prefers dark mode interface settings across all applications",
        metadata: { type: "preference", importance: "high", agent: "main" },
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        score: 0.95,
      },
      {
        id: "2",
        content: "Project uses Next.js 15 with App Router and TypeScript for the dashboard",
        metadata: { type: "project", importance: "high", agent: "main" },
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
        score: 0.89,
      },
    ],
  };

  // Add agent-specific memories
  activeAgents.forEach(agent => {
    mockMemoriesByAgent[agent.id] = [
      {
        id: `${agent.id}-1`,
        content: `${agent.name} specializes in ${agent.capabilities?.join(", ") || "general tasks"}`,
        metadata: { type: "agent", importance: "medium", agent: agent.id },
        createdAt: new Date(Date.now() - 1000 * 60 * 45),
        score: 0.92,
      },
      {
        id: `${agent.id}-2`,
        content: `Recent activity: Processed 15 tasks with 98% success rate`,
        metadata: { type: "performance", importance: "low", agent: agent.id },
        createdAt: new Date(Date.now() - 1000 * 60 * 90),
        score: 0.78,
      },
    ];
  });

  const getDisplayMemories = () => {
    let sourceMemories = searchQuery ? searchResults : Object.values(mockMemoriesByAgent).flat();

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
    total: Object.values(mockMemoriesByAgent).flat().length,
    highImportance: Object.values(mockMemoriesByAgent).flat().filter((m) => m.metadata.importance === "high").length,
    avgScore: Object.values(mockMemoriesByAgent).flat().reduce((sum, m) => sum + (m.score || 0), 0) / Object.values(mockMemoriesByAgent).flat().length,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
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
            <Button onClick={handleSearch} disabled={!searchQuery.trim() || loading}>
              {loading ? tCommon('loading') : tCommon('search')}
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
        {displayMemories.length > 0 ? (
          displayMemories.map((memory) => (
            <Card key={memory.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {editingMemory?.id === memory.id ? (
                      <Textarea
                        value={editingMemory.content}
                        onChange={(e) => setEditingMemory({ ...editingMemory, content: e.target.value })}
                        className="min-h-[100px] font-mono text-sm"
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{memory.content}</p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getAgentIcon(memory.metadata.agent as string)}
                        <span>{getAgentName(memory.metadata.agent as string)}</span>
                      </div>

                      <Badge variant="outline" className="text-xs">
                        {String(memory.metadata.type)}
                      </Badge>

                      <Badge
                        variant={memory.metadata.importance === "high" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {String(memory.metadata.importance)}
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
                    </div>

                    {/* Metadata preview */}
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {Object.entries(memory.metadata).map(([key, value]) => (
                        key !== "type" && key !== "importance" && key !== "agent" && (
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
