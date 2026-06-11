'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Loader2, MessageSquarePlus, History, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase/client';
import { useChatHistory, ChatMessage } from '@/hooks/useChatHistory';
import { LibraryCardsList, EventCardsList, CafeteriaCardsList, AcademicsCardsList } from '@/components/chat/GenerativeCards';

export function ChatInterface() {
  const { threads, activeThreadId, setActiveThreadId, createNewChat, deleteChat, loading: historyLoading } = useChatHistory();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync active thread messages to local state
  useEffect(() => {
    if (activeThreadId) {
      const activeThread = threads.find(t => t.id === activeThreadId);
      if (activeThread) {
        setMessages(activeThread.messages || []);
      }
    }
    // We intentionally DO NOT clear messages if activeThreadId is null here.
    // If we did, sending the first message of a new chat would flicker as the listener 
    // fires before activeThreadId is updated locally.
  }, [activeThreadId, threads]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, toolStatus, isLoading, showHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setToolStatus("Analyzing request...");

    try {
      const interval = setInterval(() => {
        setToolStatus(prev => {
          if (prev === "Analyzing request...") return "Querying MCP servers...";
          if (prev === "Querying MCP servers...") return "Synthesizing response...";
          return prev;
        });
      }, 1500);

      const userToken = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      
      const payload: any = {
        messages: [...messages, userMessage],
      };

      if (activeThreadId) {
        payload.chatId = activeThreadId;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(userToken ? { 'Authorization': `Bearer ${userToken}` } : {})
        },
        body: JSON.stringify(payload),
      });

      clearInterval(interval);
      setToolStatus(null);

      if (!response.ok) throw new Error('Failed to fetch response');
      
      const data = await response.json();
      
      if (!activeThreadId && data.chatId) {
        setActiveThreadId(data.chatId);
      } else if (!activeThreadId) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }
      // If activeThreadId exists, the snapshot listener in useChatHistory will automatically 
      // update the threads array, which triggers our useEffect to update local messages state!
      
    } catch (error) {
      console.error(error);
      setToolStatus(null);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden glass-panel border border-border-default shadow-lg bg-bg-surface dark:bg-bg-surface relative">
      {/* Chat History Header */}
      <div className="p-4 border-b border-border-default bg-bg-elevated dark:bg-bg-elevated flex justify-between items-center z-20">
        <h2 className="text-sm font-semibold tracking-wide text-text-primary uppercase flex items-center gap-2">
          <Bot className="w-5 h-5 text-accent-primary" />
          AURA Assistant
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 rounded-full text-text-secondary hover:text-text-primary hover:bg-border-default transition-colors"
            onClick={() => {
              setMessages([]);
              createNewChat();
              setShowHistory(false);
            }}
            title="New Chat"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`w-8 h-8 rounded-full transition-colors ${showHistory ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-secondary hover:text-text-primary hover:bg-border-default'}`}
            onClick={() => setShowHistory(!showHistory)}
            title="Chat History"
          >
            <History className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* History Overlay Panel */}
      {showHistory && (
        <div className="absolute top-[65px] inset-x-0 bottom-0 bg-bg-surface/95 backdrop-blur-md z-10 flex flex-col animate-slide-up border-t border-border-default">
          <div className="p-4 border-b border-border-default flex justify-between items-center bg-bg-elevated/50">
            <h3 className="text-sm font-semibold text-text-primary">Chat History</h3>
            <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full" onClick={() => setShowHistory(false)}>
              <X className="w-4 h-4 text-text-secondary" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {historyLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
              </div>
            ) : threads.length === 0 ? (
              <div className="text-center text-sm text-text-tertiary mt-10">
                No past conversations found.
              </div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`flex items-center w-full p-2 rounded-lg border transition-all ${
                    activeThreadId === thread.id 
                      ? 'bg-accent-primary/10 border-accent-primary/30 text-text-primary' 
                      : 'bg-bg-elevated border-border-default text-text-secondary hover:bg-border-default/50 hover:text-text-primary'
                  }`}
                >
                  <button
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setShowHistory(false);
                    }}
                    className="flex-1 text-left p-1"
                  >
                    <div className="font-medium text-sm truncate">{thread.title || "New Conversation"}</div>
                    <div className="text-xs text-text-tertiary mt-1">
                      {thread.updatedAt?.toDate ? thread.updatedAt.toDate().toLocaleDateString() : 'Just now'}
                    </div>
                  </button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 rounded-full text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeThreadId === thread.id) {
                        setMessages([]);
                      }
                      deleteChat(thread.id);
                    }}
                    title="Delete Chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-text-tertiary space-y-4 animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-events flex items-center justify-center shadow-lg shadow-accent-primary/20 mb-2">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <p className="max-w-[250px] text-sm leading-relaxed">
              I am AURA. Ask me anything about library books, cafeteria menus, events, or your academic schedule.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-events flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-accent-primary text-white rounded-tr-sm' 
                    : 'bg-bg-elevated text-text-primary border border-border-default rounded-tl-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-bg-canvas prose-pre:border prose-pre:border-border-default">
                    <ReactMarkdown
                      components={{
                        code(props) {
                          const { children, className, node, ...rest } = props;
                          const match = /language-(\w+)/.exec(className || '');
                          if (match && match[1] === 'json') {
                            try {
                              const jsonString = String(children).replace(/\n$/, '');
                              const parsed = JSON.parse(jsonString);
                              
                              if (parsed.type === 'library_cards') {
                                return <LibraryCardsList data={parsed.data} />;
                              }
                              if (parsed.type === 'event_cards') {
                                return <EventCardsList data={parsed.data} />;
                              }
                              if (parsed.type === 'cafeteria_cards') {
                                return <CafeteriaCardsList data={parsed.data} />;
                              }
                              if (parsed.type === 'academics_cards') {
                                return <AcademicsCardsList data={parsed.data} />;
                              }
                            } catch (e) {
                              // If it's not valid JSON or doesn't match our schema, fallback to normal code block
                            }
                          }
                          return (
                            <code {...rest} className={className}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border-default flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-text-secondary" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Tool Call Indicator / Loading State */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-slide-up">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-events flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="bg-bg-elevated border border-border-default rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
              <span className="text-sm text-text-secondary">{toolStatus || "Thinking..."}</span>
              <span className="flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-pulse-dot" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-pulse-dot" style={{ animationDelay: '300ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-pulse-dot" style={{ animationDelay: '600ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border-default bg-bg-surface dark:bg-bg-surface z-10">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AURA..." 
            className="flex-1 bg-bg-elevated border-border-default text-text-primary focus-visible:ring-accent-primary h-11 rounded-xl"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-accent-primary hover:bg-accent-secondary text-white transition-all shadow-md shadow-accent-primary/20 h-11 w-11 rounded-xl shrink-0"
            size="icon"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
