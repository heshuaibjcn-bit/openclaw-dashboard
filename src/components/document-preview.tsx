"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Image as ImageIcon,
  FileCode,
  FileJson,
  X,
  Download,
  ExternalLink,
  Calendar,
  HardDrive,
  Clock,
} from "lucide-react";
import { useTranslations } from 'next-intl';

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    name: string;
    path: string;
    type: "file" | "folder";
    size?: number;
    modified?: string;
  } | null;
  content?: string;
}

export function DocumentPreview({
  open,
  onOpenChange,
  document,
  content = "",
}: DocumentPreviewProps) {
  const tCommon = useTranslations('common');
  const [previewContent, setPreviewContent] = useState(content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFileIcon = () => {
    if (!document) return <FileText className="h-5 w-5" />;
    const name = document.name.toLowerCase();

    if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".gif") || name.endsWith(".svg") || name.endsWith(".webp")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    if (name.endsWith(".json")) return <FileJson className="h-5 w-5 text-yellow-500" />;
    if (name.endsWith(".js") || name.endsWith(".ts") || name.endsWith(".jsx") || name.endsWith(".tsx") || name.endsWith(".py") || name.endsWith(".go")) {
      return <FileCode className="h-5 w-5 text-blue-600" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getFileType = () => {
    if (!document) return "unknown";
    const name = document.name.toLowerCase();

    if (name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return "image";
    if (name.match(/\.(md|markdown)$/)) return "markdown";
    if (name.match(/\.(json|xml|yaml|yml)$/)) return "data";
    if (name.match(/\.(js|ts|jsx|tsx|py|go|rs|java|cpp|c|h)$/)) return "code";
    return "text";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const renderPreview = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p>Failed to load preview</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      );
    }

    if (!document) return null;

    const fileType = getFileType();

    // Image preview
    if (fileType === "image" && previewContent) {
      return (
        <div className="flex items-center justify-center h-full">
          <img
            src={`data:image/${getFileExtension(document.name)};base64,${previewContent}`}
            alt={document.name}
            className="max-w-full max-h-[600px] object-contain rounded-lg"
            onError={() => setError("Failed to load image")}
          />
        </div>
      );
    }

    // Code/Text preview with syntax highlighting
    if (fileType === "code" || fileType === "text" || fileType === "data" || fileType === "markdown") {
      return (
        <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
          <code>{previewContent || "No content available"}</code>
        </pre>
      );
    }

    // Default text preview
    return (
      <div className="text-sm whitespace-pre-wrap p-4 bg-muted rounded-lg">
        {previewContent || "No content available"}
      </div>
    );
  };

  const getFileExtension = (filename: string) => {
    const ext = filename.split(".").pop();
    return ext || "txt";
  };

  const handleDownload = () => {
    if (!previewContent) return;

    const blob = new Blob([previewContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = document?.name || "document";
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenInEditor = () => {
    if (!document) return;
    // Open in VS Code or default editor
    const vscodeUrl = `vscode://file/${document.path}`;
    window.open(vscodeUrl, "_blank");
  };

  useEffect(() => {
    if (open && document && !content) {
      // Load content when dialog opens
      setPreviewContent("");
      setError(null);

      // For now, use placeholder content
      // In production, you would fetch the actual file content
      const placeholderContent = `// ${document.name}\n// File path: ${document.path}\n// Size: ${formatFileSize(document.size)}\n// Modified: ${formatDate(document.modified)}\n\n${getFileExtension(document.name).toUpperCase()} file content preview...\n\n[Note: This is a placeholder. Implement actual file reading in production.]`;
      setPreviewContent(placeholderContent);
    }
  }, [open, document, content]);

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-muted">
                {getFileIcon()}
              </div>
              <div className="flex-1 space-y-1">
                <DialogTitle className="text-lg">{document.name}</DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  {document.path}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-4 px-6 pb-4 border-b">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HardDrive className="h-4 w-4" />
            <span>{formatFileSize(document.size)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDate(document.modified)}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {getFileExtension(document.name).toUpperCase()}
          </Badge>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleOpenInEditor}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Editor
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        <ScrollArea className="flex-1 px-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading preview...</p>
            </div>
          ) : (
            renderPreview()
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
