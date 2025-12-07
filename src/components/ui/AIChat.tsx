"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Bot,
    Send,
    Loader2,
    Sparkles,
    User,
    Trash2,
    MessageSquare,
    Cpu,
    Zap,
    RefreshCw
} from "lucide-react";
import { useAnalysis } from "@/contexts/AnalysisContext";

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface AIChatProps {
    className?: string;
}

export function AIChat({ className = "" }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { feeds, stats, lastUpdate } = useAnalysis();

    // Auto-scroll ke bawah saat ada pesan baru
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Generate welcome message content
    const getWelcomeContent = useCallback(() => {
        return `👋 Halo! Saya **AI Analytics Assistant**.

📊 **Status Monitoring Saat Ini:**
• 🎥 ${stats.activeCameras} kamera aktif
• 👥 ${stats.totalPeople} orang terdeteksi
• ⚠️ ${stats.totalAlerts} alert aktif

Saya siap membantu menganalisis data CCTV Anda. Silakan tanyakan apapun!`;
    }, [stats.activeCameras, stats.totalPeople, stats.totalAlerts]);

    // Welcome message - update when stats change
    useEffect(() => {
        const welcomeContent = getWelcomeContent();

        if (messages.length === 0) {
            // Initial welcome message
            setMessages([{
                role: 'assistant',
                content: welcomeContent,
                timestamp: new Date()
            }]);
        } else if (messages.length === 1 && messages[0].role === 'assistant') {
            // Update welcome message if stats changed and it's still the only message
            setMessages([{
                ...messages[0],
                content: welcomeContent
            }]);
        }
    }, [getWelcomeContent, messages.length]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const analyticsContext = {
                activeCameras: stats.activeCameras,
                totalPeople: stats.totalPeople,
                totalAlerts: stats.totalAlerts,
                lastUpdate: lastUpdate.toLocaleString('id-ID'),
                feeds: feeds.map(f => ({
                    name: f.name,
                    location: f.location,
                    peopleCount: f.peopleCount,
                    status: f.status,
                    alerts: f.alerts
                }))
            };

            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    analyticsContext
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: data.message,
                        timestamp: new Date()
                    }]);
                } else {
                    throw new Error(data.error);
                }
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Maaf, terjadi kesalahan koneksi. Silakan coba lagi.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: `🔄 **Chat direset!**

📊 **Status Terkini:**
• 🎥 ${stats.activeCameras} kamera aktif
• 👥 ${stats.totalPeople} orang terdeteksi

Ada yang bisa saya bantu?`,
            timestamp: new Date()
        }]);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const suggestions = [
        "📊 Ringkasan analisis",
        "👥 Kamera terpadat?",
        "📈 Tren pengunjung",
        "⚠️ Status alert"
    ];

    // Format message with markdown-like styling
    const formatMessage = (content: string) => {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <Card className={`flex flex-col overflow-hidden bg-gradient-to-b from-[#0a0a1a] to-[#0d0d20] border-primary/30 shadow-[0_0_30px_rgba(0,255,148,0.1)] ${className}`}>
            {/* Header - Glassmorphism */}
            <div className="relative p-4 border-b border-primary/20 bg-gradient-to-r from-primary/10 via-cyan-500/10 to-primary/10">
                {/* Animated background */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwZmY5NDEwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* AI Avatar with glow */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/50 rounded-xl blur-lg animate-pulse" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-cyan-400 to-primary flex items-center justify-center shadow-lg overflow-hidden p-[2px]">
                                <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover rounded-[10px]" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                                AI Assistant
                                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                            </h3>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="flex items-center gap-1 text-primary">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#00ff94]" />
                                    Online
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-400">Kolosal AI</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearChat}
                        className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                        title="Reset Chat"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[280px] max-h-[350px] scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${message.role === 'user' ? 'flex-row-reverse' : ''
                            }`}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden ${message.role === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : 'bg-gradient-to-br from-primary to-cyan-500 p-[1px]'
                            }`}>
                            {message.role === 'user'
                                ? <User className="w-4 h-4 text-white" />
                                : <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover rounded-md" />
                            }
                        </div>

                        {/* Message bubble */}
                        <div className={`max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                            <div className={`rounded-2xl px-4 py-3 shadow-lg ${message.role === 'user'
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm'
                                : 'bg-gradient-to-br from-[#1a1a30] to-[#151525] text-gray-100 rounded-tl-sm border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                                }`}>
                                <p
                                    className="text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1.5 px-2 flex items-center gap-1">
                                {message.role === 'assistant' && <Zap className="w-3 h-3 text-primary" />}
                                {message.timestamp.toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                    <div className="flex gap-3 animate-in slide-in-from-bottom-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg overflow-hidden p-[1px]">
                            <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover rounded-md" />
                        </div>
                        <div className="bg-gradient-to-br from-[#1a1a30] to-[#151525] rounded-2xl rounded-tl-sm px-4 py-3 border border-primary/20 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-sm text-gray-400">Menganalisis...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && !isLoading && (
                <div className="px-4 pb-3">
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setInput(suggestion.replace(/^[^\s]+\s/, '')); // Remove emoji
                                    inputRef.current?.focus();
                                }}
                                className="text-xs px-3 py-2 rounded-xl bg-primary/5 text-primary hover:bg-primary/15 transition-all duration-200 border border-primary/20 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(0,255,148,0.15)]"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-primary/20 bg-gradient-to-r from-black/50 via-primary/5 to-black/50">
                <div className="flex gap-3">
                    <div className="flex-1 relative group">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Tanyakan tentang analytics..."
                            className="w-full bg-[#0a0a15] border-2 border-primary/20 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(0,255,148,0.15)] transition-all duration-300"
                            disabled={isLoading}
                        />
                        <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                    </div>
                    <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-black rounded-xl px-5 shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-50 disabled:shadow-none transition-all duration-300"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
