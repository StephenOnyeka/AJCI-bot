"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  Send, 
  Bot, 
  User, 
  Menu, 
  Plus, 
  MessageSquare, 
  Settings, 
  Sparkles,
  MoreHorizontal,
  Sun,
  Moon,
  LogOut,
  Clock
} from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: string;
  content: string;
};

type Session = {
  _id: string;
  title: string;
  createdAt: string;
  messageCount: number;
};

export default function ChatInterface() {
  const [email, setEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Initialize
  useEffect(() => {
    setMounted(true);
    const storedEmail = localStorage.getItem("chat_email");
    if (storedEmail) {
      setEmail(storedEmail);
      loadHistoryList(storedEmail);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistoryList = async (userEmail: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/history?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Failed to load sessions list:", error);
    }
  };

  const loadSession = async (sessionId: string) => {
    setIsLoadingHistory(true);
    setCurrentSessionId(sessionId);
    try {
      const response = await fetch(`http://localhost:5000/api/history/session?email=${encodeURIComponent(email)}&sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = emailInput.trim().toLowerCase();
    if (!userEmail || !userEmail.includes('@')) return;
    
    setIsLoggingIn(true);
    try {
      // Register user in MongoDB
      const regResponse = await fetch("http://localhost:5000/api/history/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      if (regResponse.ok) {
        localStorage.setItem("chat_email", userEmail);
        setEmail(userEmail);
        await loadHistoryList(userEmail);
      }
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("chat_email");
    setEmail("");
    setMessages([]);
    setSessions([]);
    setCurrentSessionId(null);
    setEmailInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !email || isSending) return;
    
    const userMessage = { role: "user", content: input };
    const optimisticMessages = [...messages, userMessage];
    
    setMessages(optimisticMessages);
    setInput("");
    setIsSending(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          messages: optimisticMessages, 
          sessionId: currentSessionId 
        }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      
      // Update messages with AI response
      setMessages([...optimisticMessages, { role: "assistant", content: data.content }]);
      
      // If this was a new session, update state and refresh sidebar
      if (!currentSessionId && data.sessionId) {
        setCurrentSessionId(data.sessionId);
        loadHistoryList(email);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages([...optimisticMessages, { 
        role: "assistant", 
        content: "Sorry, I'm having trouble connecting to the AI service right now." 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  if (!mounted) return null;

  if (!email) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
        <div className="w-full max-w-md p-8 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-xl dark:shadow-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center border border-zinc-300 dark:border-zinc-600">
              <Sparkles size={28} className="text-zinc-800 dark:text-zinc-200" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Welcome to AJCI Bot</h1>
          <p className="text-zinc-500 text-center mb-8 text-sm">Sign in to save and access your chat history</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn || !emailInput.trim()}
              className="w-full py-3 px-4 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoggingIn ? "Signing in..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-zinc-900 dark:bg-black dark:text-zinc-100 overflow-hidden font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors duration-300">
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full"
        } transition-all duration-300 ease-in-out border-r border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-[#050505] flex flex-col shrink-0 sm:relative absolute z-50 h-full`}
      >
        <div className="p-4 flex items-center justify-between">
          <button 
            className="flex-1 flex justify-center items-center gap-2 p-2.5 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-xl transition-all text-sm font-semibold shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            onClick={startNewChat}
          >
            <Plus size={16} />
            New Chat
          </button>
          
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 ml-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl sm:hidden text-zinc-500 dark:text-zinc-400"
          >
            <Menu size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full mt-2 custom-scrollbar">
          <div className="px-5 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Chats</div>
          <div className="px-3 space-y-1">
            {sessions.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Clock size={24} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                <p className="text-xs text-zinc-400">No history yet</p>
              </div>
            ) : (
              sessions.map((session) => (
                <button 
                  key={session._id}
                  onClick={() => loadSession(session._id)}
                  className={`w-full text-left p-3 rounded-xl text-sm transition-all flex flex-col gap-1 group relative overflow-hidden ${
                    currentSessionId === session._id 
                      ? "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm" 
                      : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare size={14} className={currentSessionId === session._id ? "text-black dark:text-white" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"} />
                    <span className={`truncate font-medium ${currentSessionId === session._id ? "text-black dark:text-white" : "text-zinc-600 dark:text-zinc-400"}`}>
                      {session.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 ml-6">
                    {new Date(session.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/60 flex flex-col gap-2">
          <div className="flex items-center gap-3 p-2 rounded-lg text-sm text-zinc-800 dark:text-zinc-300">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
              <User size={16} className="text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold truncate text-[13px]">{email.split('@')[0]}</span>
              <span className="text-[10px] text-zinc-500 truncate">{email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 rounded-xl transition-colors text-xs font-medium"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-black relative transition-colors duration-300">
        <header className="h-14 flex items-center px-4 md:px-6 border-b border-zinc-200 dark:border-zinc-800/40 shrink-0 sticky top-0 bg-white/70 dark:bg-black/50 backdrop-blur-md z-10 justify-between">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500"
              >
                <Menu size={18} />
              </button>
            )}
            <h1 className="font-bold text-base md:text-lg flex items-center gap-2 tracking-tight">
              AJCI Bot
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
               onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
               className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-0 scroll-smooth">
          <div className="max-w-3xl mx-auto py-10 space-y-8">
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <div className="w-8 h-8 border-2 border-zinc-200 dark:border-zinc-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                <p className="text-sm text-zinc-500">Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-zinc-200 dark:border-zinc-800">
                  <Sparkles size={36} className="text-black dark:text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-3 tracking-tight">How can I help you?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mt-8">
                  {["What is AJCI?", "Healthy food options", "Tell me a joke", "Check my history"].map((suggestion) => (
                    <button 
                      key={suggestion}
                      onClick={() => { setInput(suggestion); }}
                      className="p-4 text-sm text-left border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all font-medium text-zinc-600 dark:text-zinc-400"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, i) => (
                <div 
                  key={i} 
                  className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""} animate-in slide-in-from-bottom-2 fade-in duration-300`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                    message.role === "user" 
                      ? "bg-zinc-100 border-zinc-200 text-black dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                      : "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black"
                  }`}>
                    {message.role === "user" ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  
                  <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
                    <div className={`px-5 py-3.5 text-[15px] leading-relaxed rounded-2xl ${
                      message.role === "user"
                        ? "bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800 rounded-tr-sm"
                        : "bg-white dark:bg-black rounded-tl-sm border-0"
                    }`}>
                      {message.role === "assistant" || message.role === "model" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800/40">
          <div className="max-w-3xl mx-auto">
            <form 
              onSubmit={handleSubmit}
              className="relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 flex items-end shadow-sm"
            >
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) handleSubmit(e);
                  }
                }}
                placeholder="Ask AJCI anything..."
                className="w-full bg-transparent text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 px-3 py-3 outline-none resize-none max-h-[200px] min-h-[52px] text-[15px] leading-6"
                rows={1}
              />
              
              <div className="p-1">
                <button 
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    input.trim() && !isSending
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-md hover:scale-105" 
                      : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
            <p className="text-[10px] text-center text-zinc-400 mt-2">
              AJCI Bot can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
