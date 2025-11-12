"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

export interface ChatMessage {
    sender: "user" | "ai";
    content: string;
    id?: string;
}

interface AIChatPopupProps {
    onClose: () => void;
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function AIChatPopup({ onClose, messages, setMessages }: AIChatPopupProps) {
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        const lineHeight = 24;
        const maxLines = 4;
        const maxHeight = lineHeight * maxLines;

        if (ta.scrollHeight < maxHeight) {
            ta.style.height = ta.scrollHeight + "px";
            ta.style.overflowY = "hidden";
        } else {
            ta.style.height = maxHeight + "px";
            ta.style.overflowY = "auto";
        }
    }, [message]);

    const cleanAIResponse = (text: string) => text.trim().replace(/\n{2,}/g, "\n\n").replace(/^\s+/gm, "");

    const simulateTyping = (text: string) =>
        new Promise<void>((resolve) => {
            let index = 0;
            const msgId = Math.random().toString(36).substr(2, 9);
            setMessages((prev) => [...prev, { sender: "ai", content: "", id: msgId }]);
            const chunkSize = 3;
            const speed = Math.max(10, 400 / text.length);

            const interval = setInterval(() => {
                index += chunkSize;
                setMessages((prev) =>
                    prev.map((m) => (m.id === msgId ? { ...m, content: text.slice(0, index) } : m))
                );
                if (index >= text.length) {
                    clearInterval(interval);
                    resolve();
                }
            }, speed);
        });

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!message.trim()) return;

        setMessages((prev) => [...prev, { sender: "user", content: message }]);
        setMessage("");
        setIsTyping(true);

        try {
            const res = await fetch("http://localhost:8000/api/ai/consultation/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
                credentials: "include",
            });
            const data = await res.json();
            setIsTyping(false);

            if (data.success) {
                if (data.summary) await simulateTyping(cleanAIResponse(data.summary));
                else if (data.results) {
                    for (const result of data.results) {
                        await simulateTyping(`${result.field_name}:\n${cleanAIResponse(result.ai_reply)}`);
                    }
                } else if (data.ai_reply) {
                    await simulateTyping(cleanAIResponse(data.ai_reply));
                }
            } else {
                await simulateTyping("Vui lòng đăng nhập để sử dụng chức năng này nhé 😅");
            }
        } catch {
            setIsTyping(false);
            await simulateTyping("Không kết nối được server 😢");
        }
    };

    const handleReset = () => {
        setMessages([]);
        setMessage("");
        setIsTyping(false);
    };

    return (
        <div className="fixed bottom-6 right-6 w-[90vw] max-w-[450px] h-[70vh] md:h-[500px] bg-white shadow-2xl rounded-xl border border-gray-200 flex flex-col z-[99999]">
            <div className="flex items-center justify-between p-2 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-[#5b8c51] ml-2">Bác sĩ lúa</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:border-gray-600 transition-all"
                        title="Xóa tất cả tin nhắn"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:border-gray-600 transition-all"
                        title="Đóng"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div ref={scrollContainerRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
                {messages.length === 0 && (
                    <div className="text-gray-500 text-sm italic text-center mt-2">
                        🌱 Chào mừng bạn, hôm nay bạn muốn tìm hiểu gì?
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={msg.id || idx}
                        className={`px-3 py-2 rounded-xl max-w-[80%] whitespace-pre-wrap break-words ${msg.sender === "user" ? "self-end bg-green-100 text-[#5b8c51]" : "self-start bg-gray-100 text-gray-900"
                            }`}
                    >
                        {msg.sender === "ai" ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                    </div>
                ))}
                {isTyping && (
                    <div className="self-start px-3 py-2 bg-gray-100 text-gray-700 rounded-xl max-w-[60%] flex items-center gap-3">
                        <span>Chờ chút Bác sĩ đang suy nghĩ</span>
                        <motion.div className="w-6 h-6" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full"></div>
                        </motion.div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 flex items-end gap-2">
                <textarea
                    ref={textareaRef}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none overflow-y-auto scrollbar-none focus:outline-none focus:ring-2 focus:ring-green-400 max-h-[96px]"
                />
                <button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-4 py-3 rounded-full hover:bg-green-700 transition-colors h-[48px] flex-shrink-0"
                >
                    Gửi
                </button>
            </div>
        </div>
    );
}
