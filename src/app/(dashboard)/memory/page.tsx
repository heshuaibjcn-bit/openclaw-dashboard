"use client";

import { useState } from "react";
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
  Database,
  Search,
  Sparkles,
  Clock,
  FileText,
  TrendingUp,
  Filter,
  RefreshCw,
  Brain,
} from "lucide-react";
import { useMemorySearch } from "@/lib/openclaw";
import type { MemoryEntry } from "@/lib/openclaw";

export default function MemoryPage() {
  const { data: memories, loading, search } = useMemorySearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<MemoryEntry[]>([]);

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

  // Mock memory data for display
  const mockMemories: MemoryEntry[] = [
    {
      id: "1",
      content: "User prefers dark mode interface settings across all applications",
      metadata: { type: "preference", importance: "high" },
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      score: 0.95,
    },
    {
      id: "2",
      content: "Project uses Next.js 15 with App Router and TypeScript for the dashboard",
      metadata: { type: "project", importance: "high" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      score: 0.89,
    },
    {
      id: "3",
      content: "OpenClaw Gateway runs on port 18789 with WebSocket support",
      metadata: { type: "configuration", importance: "medium" },
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
      score: 0.82,
    },
    {
      id: "4",
      content: "Agent session tokens are tracked with a maximum of 204800 tokens",
      metadata: { type: "agent", importance: "medium" },
      createdAt: new Date(Date.now() - 1000 * 60 * 180),
      score: 0.76,
    },
    {
      id: "5",
      content: "Feishu channel is configured for enterprise messaging integration",
      metadata: { type: "channel", importance: "high" },
      createdAt: new Date(Date.now() - 1000 * 60 * 240),
      score: 0.91,
    },
  ];

  const displayMemories = searchQuery ? searchResults : mockMemories;
  const filteredMemories = selectedTag !== "all"
    ? displayMemories.filter((m) => m.metadata.type === selectedTag)
    : displayMemories;

  const allTags = ["all", "preference", "project", "configuration", "agent", "channel"];
  const stats = {
    total: mockMemories.length,
    highImportance: mockMemories.filter((m) => m.metadata.importance === "high").length,
    avgScore: mockMemories.reduce((sum, m) => sum + (m.score || 0), 0) / mockMemories.length,
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground";
    if (score >= 0.9) return "text-green-500";
    if (score >= 0.7) return "text-yellow-500";
    return "text-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Memory</h2>
          <p className="text-muted-foreground">
            Search and browse agent memory from LanceDB
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Stored entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Importance</CardTitle>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highImportance}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Important memories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.avgScore * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Relevance score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Embeddings</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1024</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vector dimensions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Search Memory</CardTitle>
          <CardDescription>
            Search through agent memory using semantic similarity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search memories... (e.g., 'user preferences', 'project config')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={!searchQuery.trim() || loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by type:</span>
          <Select value={selectedTag} onValueChange={(value) => setSelectedTag(value)}>
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
          Showing {filteredMemories.length} memories
        </div>
      </div>

      {/* Memory Entries */}
      <div className="grid gap-4">
        {filteredMemories.length > 0 ? (
          filteredMemories.map((memory) => (
            <Card key={memory.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm leading-relaxed">{memory.content}</p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {memory.metadata.type}
                      </Badge>

                      <Badge
                        variant={memory.metadata.importance === "high" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {memory.metadata.importance}
                      </Badge>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(memory.createdAt).toLocaleString()}
                      </div>

                      {memory.score !== undefined && (
                        <div className="flex items-center gap-1 text-xs">
                          <Sparkles className={`h-3 w-3 ${getScoreColor(memory.score)}`} />
                          <span className={getScoreColor(memory.score)}>
                            {Math.round(memory.score * 100)}% match
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata preview */}
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {Object.entries(memory.metadata).map(([key, value]) => (
                        key !== "type" && key !== "importance" && (
                          <span key={key} className="bg-muted px-2 py-1 rounded">
                            {key}: {String(value)}
                          </span>
                        )
                      ))}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No memories match your search" : "No memories found"}
              </p>
              {!searchQuery && (
                <p className="text-sm text-muted-foreground mt-1">
                  Memories will be stored as the agent learns
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Memory Info */}
      <Card>
        <CardHeader>
          <CardTitle>About Memory</CardTitle>
          <CardDescription>
            How the agent uses LanceDB for long-term memory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Semantic Search</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Memories are stored as vector embeddings using Jina embeddings, allowing for semantic similarity search.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Persistent Storage</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                All memories are persisted in LanceDB, ensuring they survive agent restarts and context window resets.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Automatic Capture</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Important information is automatically captured from conversations and stored with relevance scores.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Smart Retrieval</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                The agent retrieves relevant memories based on the current context, using hybrid vector and keyword search.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
