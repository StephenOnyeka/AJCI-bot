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
  Moon
} from "lucide-react";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages([...newMessages, { 
        role: "assistant", 
        content: "API connection pending. I am a highly advanced placeholder waiting for the AJCI SDK to be fully integrated. You can easily connect the ai sdk using `useChat` hook." 
      }]);
    }, 1000);
  };

  if (!mounted) return null; // Avoid hydration mismatch for theme toggle

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
          <div className="px-5 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent</div>
          <div className="px-3 space-y-1">
            {["UI Component Build", "API System Design"].map((item, i) => (
              <button key={i} className="w-full text-left p-2.5 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50 rounded-lg text-sm transition-colors text-zinc-700 dark:text-zinc-300 flex items-center gap-3 truncate group">
                <MessageSquare size={16} className="shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-zinc-300 transition-colors" />
                <span className="truncate">{item}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/60">
          <button className="w-full flex items-center gap-3 p-2 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/50 rounded-lg transition-colors text-sm text-zinc-800 dark:text-zinc-300">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-200 via-zinc-300 to-zinc-100 dark:from-zinc-700 dark:via-zinc-800 dark:to-black flex items-center justify-center border border-zinc-300 dark:border-zinc-600 shadow-inner">
              <User size={14} className="text-zinc-600 dark:text-zinc-300" />
            </div>
            <span className="font-medium truncate">AJCI User</span>
            <Settings size={14} className="ml-auto text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors" />
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
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 uppercase tracking-widest hidden sm:inline-block">
              Dev Mode
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-0">
          <div className="max-w-3xl mx-auto py-10 space-y-10">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-in fade-in zoom-in duration-700">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-300 via-black to-zinc-200 dark:from-zinc-500 dark:via-white dark:to-zinc-400 rounded-[2rem] blur-xl opacity-20"></div>
                  <div className="relative w-full h-full bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-800 dark:to-black rounded-[2rem] flex items-center justify-center shadow-2xl border border-zinc-200 dark:border-zinc-700/50 transition-colors duration-300">
                    <Sparkles size={40} className="text-black dark:text-white drop-shadow-md dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-colors" />
                  </div>
                </div>
                <h2 className="text-3xl font-semibold mb-3 tracking-tight text-black dark:text-white transition-colors duration-300">How can I assist you?</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-base max-w-sm transition-colors duration-300">
                  The interface is ready. Connect your AJCI API key in the backend to start building.
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
                      {message.content}
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
            <div className="text-center mt-3 text-xs text-zinc-500 dark:text-zinc-600 font-medium pb-1 tracking-wide transition-colors">
              Interface is ready. Connect your AJCI API to start generating responses.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
