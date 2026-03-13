"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Folder,
  Search,
  RefreshCw,
  Edit,
  Save,
  X,
  ChevronRight,
  ChevronDown,
  Home,
  Bot,
  File,
  FileJson,
  FileCode,
  FileType,
} from "lucide-react";
import { getActiveAgents, getAllAgents } from "@/lib/openclaw/config-reader";
import { useDocuments } from "@/lib/openclaw";

interface DocumentNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: DocumentNode[];
  agent?: string;
  modified?: string;
  size?: number;
}

interface FileContent {
  content: string;
  path: string;
  modified: string;
}

export default function DocumentsPage() {
  const t = useTranslations('documents');
  const tCommon = useTranslations('common');
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingFile, setEditingFile] = useState<{ path: string; content: string } | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, FileContent>>({});

  // Load active agents from openclaw.json
  const activeAgents = useMemo(() => getActiveAgents().map(a => a.id), []);

  // Use real API hook for documents
  const { data: apiDocuments, loading, refetch } = useDocuments(
    selectedAgent === "all" ? undefined : selectedAgent
  );

  // Process documents data or fallback to mock
  const documents = useMemo(() => {
    if (!apiDocuments || Object.keys(apiDocuments).length === 0) {
      // Fallback to mock data structure
      const mockDocs: Record<string, DocumentNode[]> = {
        main: [
          {
            name: "README.md",
            path: "/README.md",
            type: "file",
            modified: "2025-03-13T10:30:00Z",
          },
          {
            name: "openclaw.json",
            path: "/openclaw.json",
            type: "file",
            modified: "2025-03-13T09:15:00Z",
          },
          {
            name: "config",
            path: "/config",
            type: "folder",
            children: [
              {
                name: "channels.json",
                path: "/config/channels.json",
                type: "file",
              },
              {
                name: "models.json",
                path: "/config/models.json",
                type: "file",
              },
            ],
          },
        ],
      };

      // Add agent-specific documents
      getActiveAgents().forEach(agent => {
        mockDocs[agent.id] = [
          {
            name: "system-prompt.md",
            path: `/${agent.id}/system-prompt.md`,
            type: "file",
            agent: agent.id,
            modified: "2025-03-12T14:20:00Z",
          },
          {
            name: "knowledge-base",
            path: `/${agent.id}/knowledge-base`,
            type: "folder",
            agent: agent.id,
            children: [
              {
                name: "domain-knowledge.md",
                path: `/${agent.id}/knowledge-base/domain-knowledge.md`,
                type: "file",
                agent: agent.id,
              },
              {
                name: "guidelines.md",
                path: `/${agent.id}/knowledge-base/guidelines.md`,
                type: "file",
                agent: agent.id,
              },
            ],
          },
          {
            name: "tools.md",
            path: `/${agent.id}/tools.md`,
            type: "file",
            agent: agent.id,
            modified: "2025-03-11T16:45:00Z",
          },
        ];
      });

      return mockDocs;
    }

    return apiDocuments;
  }, [apiDocuments]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const loadFileContent = async (path: string) => {
    if (fileContents[path]) {
      return fileContents[path];
    }

    // TODO: Replace with actual file read API
    // For now, return mock content
    const mockContent: FileContent = {
      content: `# ${path.split("/").pop()}\n\nThis is a sample file content.\n\nIn production, this would be loaded from the actual file at:\n${path}\n\nTODO: Integrate with file system API.`,
      path,
      modified: new Date().toISOString(),
    };

    setFileContents(prev => ({ ...prev, [path]: mockContent }));
    return mockContent;
  };

  const handleFileClick = async (node: DocumentNode) => {
    if (node.type === "folder") {
      toggleFolder(node.path);
      return;
    }

    const file = await loadFileContent(node.path);
    setEditingFile({ path: node.path, content: file.content });
  };

  const handleSaveFile = () => {
    if (!editingFile) return;

    // TODO: Replace with actual file write API
    console.log("Saving file:", editingFile.path, editingFile.content);

    // Update file contents
    setFileContents(prev => ({
      ...prev,
      [editingFile.path]: {
        content: editingFile.content,
        path: editingFile.path,
        modified: new Date().toISOString(),
      },
    }));

    setEditingFile(null);
  };

  const handleCancelEdit = () => {
    setEditingFile(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith(".md")) return <FileText className="h-4 w-4 text-blue-500" />;
    if (name.endsWith(".json")) return <FileJson className="h-4 w-4 text-yellow-500" />;
    if (name.endsWith(".ts") || name.endsWith(".js")) return <FileCode className="h-4 w-4 text-blue-600" />;
    if (name.endsWith(".txt")) return <FileType className="h-4 w-4 text-gray-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const getFilteredDocuments = () => {
    if (selectedAgent === "all") {
      return documents;
    }
    return { [selectedAgent]: documents[selectedAgent] || [] };
  };

  const renderNode = (node: DocumentNode, level = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isFolder = node.type === "folder";
    const paddingLeft = level * 16;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 py-1.5 px-2 hover:bg-muted/50 rounded cursor-pointer transition-colors`}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
          onClick={() => handleFileClick(node)}
        >
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <Folder className="h-4 w-4 text-yellow-500" />
            </>
          ) : (
            <div className="w-4" />
          )}
          {isFolder ? (
            <span className="text-sm font-medium">{node.name}</span>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              {getFileIcon(node.name)}
              <span className="text-sm">{node.name}</span>
            </div>
          )}
          {node.modified && (
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(node.modified).toLocaleDateString()}
            </span>
          )}
        </div>
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const stats = {
    totalFiles: Object.values(documents).flat().filter(n => n.type === "file").length,
    totalFolders: Object.values(documents).flat().filter(n => n.type === "folder").length,
    totalAgents: activeAgents.length,
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
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {tCommon('refresh')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalFiles')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('acrossAllSections')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeAgents')}</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('withDocumentSections')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('fileSystem')}</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFolders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('folders')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedAgent} onValueChange={(value) => value && setSelectedAgent(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('allAgents')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="main">Main (Root)</SelectItem>
                {getAllAgents().map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* File Editor */}
      {editingFile && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{tCommon('editing')}: {editingFile.path}</CardTitle>
                <CardDescription>
                  {t('changesWillBeWritten')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <X className="mr-2 h-4 w-4" />
                  {tCommon('cancel')}
                </Button>
                <Button size="sm" onClick={handleSaveFile}>
                  <Save className="mr-2 h-4 w-4" />
                  {tCommon('save')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <textarea
              value={editingFile.content}
              onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
              className="w-full min-h-[400px] p-4 font-mono text-sm bg-muted rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </CardContent>
        </Card>
      )}

      {/* File Tree */}
      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <Card className="lg:col-span-2">
            <CardContent className="flex items-center justify-center py-16">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          <>
            {Object.entries(getFilteredDocuments()).map(([section, nodes]) => (
              <Card key={section}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {section === "main" ? (
                      <Home className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Bot className="h-5 w-5 text-purple-500" />
                    )}
                    <CardTitle className="text-base">
                      {section === "main" ? "Main" : getAllAgents().find(a => a.id === section)?.name || section}
                    </CardTitle>
                    {section !== "main" && (
                      <Badge variant="outline" className="text-xs">
                        Agent
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {section === "main"
                      ? "Root-level OpenClaw configuration files"
                      : `Agent-specific documents and knowledge base`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {nodes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No documents found
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {nodes.map(node => renderNode(node))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('aboutDocuments')}</CardTitle>
          <CardDescription>{t('howDocumentWorkspaceWorks')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium">{t('mainSection')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('mainSectionDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium">{t('agentSections')}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('agentSectionsDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-green-500" />
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
