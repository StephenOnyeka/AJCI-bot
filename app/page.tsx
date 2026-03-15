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
  LogOut
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatInterface() {
  const [email, setEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedEmail = localStorage.getItem("chat_email");
    if (storedEmail) {
      setEmail(storedEmail);
      loadHistory(storedEmail);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistory = async (userEmail: string) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`http://localhost:5000/api/history?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) return;
    
    setIsLoggingIn(true);
    const userEmail = emailInput.trim();
    localStorage.setItem("chat_email", userEmail);
    setEmail(userEmail);
    await loadHistory(userEmail);
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("chat_email");
    setEmail("");
    setMessages([]);
    setEmailInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !email) return;
    
    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    
    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      setMessages([...newMessages, data]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages([...newMessages, { 
        role: "assistant", 
        content: "Sorry, I'm having trouble connecting to the AI service right now." 
      }]);
    }
  };

  if (!mounted) return null; // Avoid hydration mismatch for theme toggle

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
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full"
        } transition-transform duration-300 ease-in-out border-r border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-[#050505] flex flex-col shrink-0 sm:relative absolute z-50 h-full`}
      >
        <div className="p-4 flex items-center justify-between">
          <button 
            className="flex-1 flex justify-center items-center gap-2 p-2.5 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-xl transition-all text-sm font-semibold shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            onClick={() => setMessages([])}
          >
            <Plus size={16} />
            New Chat
          </button>
          
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 ml-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl sm:hidden text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full mt-2">
          <div className="px-5 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">History</div>
          <div className="px-3 space-y-1">
            <button className="w-full text-left p-2.5 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50 rounded-lg text-sm transition-colors text-zinc-700 dark:text-zinc-300 flex items-center gap-3 truncate group">
              <MessageSquare size={16} className="shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-zinc-300 transition-colors" />
              <span className="truncate">Current Session</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/60 flex flex-col gap-2">
          <div className="flex items-center gap-3 p-2 rounded-lg text-sm text-zinc-800 dark:text-zinc-300">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-200 via-zinc-300 to-zinc-100 dark:from-zinc-700 dark:via-zinc-800 dark:to-black flex items-center justify-center border border-zinc-300 dark:border-zinc-600 shadow-inner shrink-0">
              <User size={14} className="text-zinc-600 dark:text-zinc-300" />
            </div>
            <span className="font-medium truncate text-xs" title={email}>{email}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm"
          >
            <LogOut size={14} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-black relative transition-colors duration-300">
        <header className="h-14 flex items-center px-4 md:px-6 border-b border-zinc-200 dark:border-zinc-800/40 shrink-0 sticky top-0 bg-white/70 dark:bg-black/50 backdrop-blur-md z-10 justify-between transition-colors duration-300">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <Menu size={18} />
              </button>
            )}
            <h1 className="font-semibold text-lg flex items-center gap-2 tracking-tight group cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 px-3 py-1.5 -ml-3 justify-center rounded-lg transition-colors text-gradient">
              AJCI Interface <MoreHorizontal size={16} className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
               onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
               className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors hover:text-black dark:hover:text-white"
               aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-0">
          <div className="max-w-3xl mx-auto py-10 space-y-10">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-in fade-in zoom-in duration-700">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-300 via-black to-zinc-200 dark:from-zinc-500 dark:via-white dark:to-zinc-400 rounded-[2rem] blur-xl opacity-20"></div>
                  <div className="relative w-full h-full bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-800 dark:to-black rounded-[2rem] flex items-center justify-center shadow-2xl border border-zinc-200 dark:border-zinc-700/50 transition-colors duration-300">
                    <Sparkles size={40} className="text-black dark:text-white drop-shadow-md dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-colors" />
                  </div>
                </div>
                <h2 className="text-3xl font-semibold mb-3 tracking-tight text-black dark:text-white transition-colors duration-300">Welcome back!</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-base max-w-sm transition-colors duration-300">
                  How can I help you today?
                </p>
              </div>
            ) : (
              messages.map((message, i) => (
                <div 
                  key={i} 
                  className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""} animate-in slide-in-from-bottom-2 fade-in duration-300`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border shadow-sm transition-colors duration-300 ${
                    message.role === "user" 
                      ? "bg-gradient-to-tr from-zinc-200 to-zinc-100 border-zinc-300 text-black dark:from-zinc-800 dark:to-zinc-700 dark:border-zinc-600 dark:text-white"
                      : "bg-white border-zinc-200 text-black dark:bg-black dark:border-zinc-700 dark:text-white"
                  }`}>
                    {message.role === "user" ? <User size={18} /> : <Sparkles size={18} className="text-zinc-700 dark:text-zinc-200" />}
                  </div>
                  
                  <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500 font-medium mb-1.5 capitalize px-1 tracking-wide transition-colors">
                      {message.role === "user" ? "You" : "AJCI"}
                    </div>
                    
                    <div className={`px-5 py-3.5 text-[15px] leading-relaxed relative transition-colors duration-300 ${
                      message.role === "user"
                        ? "bg-black text-white dark:bg-white dark:text-black rounded-2xl rounded-tr-sm font-medium shadow-md"
                        : "text-zinc-800 bg-zinc-50 border-zinc-200 dark:text-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800/50 rounded-2xl rounded-tl-sm mt-0 border font-light shadow-sm"
                    }`}>
                      {message.role === "assistant" || message.role === "model" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                              li: ({ children }) => <li className="mb-1">{children}</li>,
                              code: ({ children }) => <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-sm">{children}</code>,
                              strong: ({ children }) => <strong className="font-semibold text-black dark:text-white">{children}</strong>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
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
        <div className="p-4 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-black dark:via-black/90 shrink-0 transition-colors duration-300">
          <div className="max-w-3xl mx-auto relative group">
            {/* The gradient glow behind the input box */}
            <div className="absolute -inset-[1.5px] rounded-3xl bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 dark:from-zinc-500 dark:via-zinc-300 dark:to-zinc-500 opacity-30 dark:opacity-20 group-hover:opacity-60 dark:group-hover:opacity-40 transition duration-500 blur-sm"></div>
            
            <form 
              onSubmit={handleSubmit}
              className="relative bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-1.5 flex items-end shadow-xl dark:shadow-2xl transition-all duration-300 focus-within:border-zinc-400 dark:focus-within:border-zinc-500"
            >
              <button 
                type="button"
                className="p-3 text-zinc-400 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 shrink-0 mb-0.5 ml-0.5"
              >
                <Plus size={20} />
              </button>
              
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
                placeholder="Message AJCI..."
                className="w-full bg-transparent text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 px-2 py-3.5 outline-none resize-none max-h-[200px] min-h-[52px] text-[15px] leading-6 pr-2 overflow-y-auto font-sans transition-colors duration-300"
                rows={1}
              />
              
              <div className="p-1.5 shrink-0 self-end">
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    input.trim() 
                      ? "bg-gradient-to-r from-zinc-800 to-black text-white dark:from-zinc-200 dark:to-white dark:text-black hover:scale-105 shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                      : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
                  }`}
                >
                  <Send size={16} className={input.trim() ? "translate-x-[1px] translate-y-[-1px] text-white dark:text-black" : ""} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
