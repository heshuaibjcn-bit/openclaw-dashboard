"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useAgents } from "@/lib/openclaw";
import type { Agent } from "@/lib/openclaw";

export default function AgentsPage() {
  const t = useTranslations('agents');
  const tCommon = useTranslations('common');
  const { data: agents, loading, refetch } = useAgents();
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [editingAgent, setEditingAgent] = useState({
    name: "",
    model: "",
    capabilities: [] as string[],
  });

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
              <p className="text-muted-foreground">Loading agents...</p>
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
                      <p className="text-xs text-muted-foreground mb-1">Created</p>
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
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(agent)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
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
                  ? "No agents match your search"
                  : "No agents configured"}
              </p>
              {!searchQuery && (
                <Button className="mt-4" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Agent
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
              {selectedAgent ? "Edit Agent" : "Create Agent"}
            </DialogTitle>
            <DialogDescription>
              {selectedAgent
                ? "Update agent configuration"
                : "Configure a new AI agent"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editingAgent.name}
                onChange={(e) =>
                  setEditingAgent({ ...editingAgent, name: e.target.value })
                }
                placeholder="e.g., Main Agent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={editingAgent.model}
                onValueChange={(value) =>
                  value && setEditingAgent({ ...editingAgent, model: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
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
              <Label>Capabilities</Label>
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
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedAgent ? "Save Changes" : "Create Agent"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
