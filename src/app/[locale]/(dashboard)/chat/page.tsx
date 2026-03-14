"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  MessageSquare,
  Send,
  Bot,
  User,
  RefreshCw,
  Trash2,
  Sparkles,
  Clock,
  MoreVertical,
  History,
} from "lucide-react";
import { useAgents } from "@/lib/openclaw";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "toolResult";
  content: string;
  thinking?: string;
  timestamp: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
}

interface ChatSession {
  id: string;
  filename: string;
  messageCount: number;
  firstMessage: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

export default function ChatPage() {
  const t = useTranslations('chat');
  const tCommon = useTranslations('common');
  const { data: agents } = useAgents();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("main");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load messages when session is selected
  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession);
    }
  }, [selectedSession]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await fetch('/api/chat/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
        // Auto-select the most recent session
        if (data.length > 0) {
          setSelectedSession(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          agentId: selectedAgent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add a system message about the send
        const systemMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "system",
          content: data.response || "Message sent. Check OpenClaw TUI for response.",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, systemMessage]);

        // Refresh sessions after a delay to get new messages
        setTimeout(() => {
          loadSessions();
          if (selectedSession) {
            loadMessages(selectedSession);
          }
        }, 2000);
      } else {
        // Show error message
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "system",
          content: `Error: ${data.error}`,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRefresh = () => {
    loadSessions();
    if (selectedSession) {
      loadMessages(selectedSession);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const stats = {
    total: messages.length,
    user: messages.filter((m) => m.role === "user").length,
    assistant: messages.filter((m) => m.role === "assistant").length,
    tokens: messages.reduce((sum, m) => sum + (m.tokens?.total || 0), 0),
  };

  const getSessionName = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return sessionId;

    const date = new Date(session.createdAt);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `${dateStr} ${timeStr} (${session.messageCount} messages)`;
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
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoadingSessions}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingSessions ? 'animate-spin' : ''}`} />
            {tCommon('refresh')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalMessages')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('inThisSession')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('userMessages')}</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.user}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('sentByYou')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('agentResponses')}</CardTitle>
            <Bot className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assistant}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('fromAgents')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('tokensUsed')}</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('totalTokens')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Session Selection Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              {t('agentSelection')}
            </CardTitle>
            <CardDescription>
              {isLoadingSessions ? 'Loading sessions...' : `${sessions.length} sessions`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedSession || ''} onValueChange={(value) => value && setSelectedSession(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a session">
                  {selectedSession ? getSessionName(selectedSession).substring(0, 30) + '...' : 'Select session'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-xs">{getSessionName(session.id)}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {session.lastMessage}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {agents?.find((a) => a.id === selectedAgent) && (
              <div className="space-y-2 text-sm pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('model')}</span>
                  <span className="font-medium">
                    {agents.find((a) => a.id === selectedAgent)?.model}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('status')}</span>
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">{t('active')}</Badge>
                </div>
              </div>
            )}

            <div className="pt-4 border-t space-y-2">
              <p className="text-xs text-muted-foreground">{t('capabilities')}</p>
              <div className="flex flex-wrap gap-1">
                {agents?.find((a) => a.id === selectedAgent)?.capabilities.map((cap: string) => (
                  <Badge key={cap} variant="outline" className="text-xs">
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('conversation')}</CardTitle>
                <CardDescription>
                  {selectedSession
                    ? `Session: ${selectedSession.substring(0, 8)}...`
                    : t('chattingWith', { agent: agents?.find((a) => a.id === selectedAgent)?.name || "Agent" })
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 h-[500px]">
              <div ref={scrollRef} className="p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages in this session</p>
                      <p className="text-sm mt-2">Select a different session or send a new message</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : message.role === "system"
                            ? "bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700"
                            : "bg-muted"
                        }`}
                      >
                        {message.thinking && (
                          <details className="mb-2">
                            <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                              Thinking process
                            </summary>
                            <p className="text-xs mt-1 whitespace-pre-wrap">{message.thinking}</p>
                          </details>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 text-xs opacity-70">
                            <Clock className="h-3 w-3" />
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>

                          {message.role === "assistant" && message.tokens && (
                            <span className="text-xs opacity-70">
                              {message.tokens.total} tokens
                            </span>
                          )}
                        </div>
                      </div>

                      {message.role === "user" && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary flex-shrink-0">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))
                )}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder={t('inputPlaceholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[60px] max-h-[200px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-[60px] w-[60px] flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t('pressEnter')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
