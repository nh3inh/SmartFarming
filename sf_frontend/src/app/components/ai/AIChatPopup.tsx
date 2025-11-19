"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { ChevronsDown } from "lucide-react";

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

const SUGGESTIONS = [
    "Cho tui lịch trình canh tác",
    "Hướng dẫn bón phân",
    "Cách xử lý sâu bệnh",
    "Tư vấn giống phù hợp",
    "Dự báo thời tiết hôm nay",
    "Cách cải tạo đất",
    "Thời điểm gieo sạ tốt nhất",
    "Cách tưới nước hợp lý",
    "Hướng dẫn xử lý cỏ dại",
    "Cho tui lịch phun thuốc"
];

export default function AIChatPopup({ onClose, messages, setMessages }: AIChatPopupProps) {
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const [isShowing, setIsShowing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const distanceFromBottom =
            container.scrollHeight - (container.scrollTop + container.clientHeight);

        if (distanceFromBottom <= 100) {
            container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);

            if (distanceFromBottom <= 40) {
                setShowScrollDown(false);
            } else {
                setShowScrollDown(true);
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

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

    const parseSimpleMarkdown = (text: string) => {
        text = text.replace(/### (.+)/g, '<strong class="font-bold">$1</strong>');
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');

        return text;
    };
    const simulateTyping = (text: string) =>
        new Promise<void>((resolve) => {
            setIsTyping(true);
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
                    setIsTyping(false);
                    resolve();
                }
            }, speed);
        });

    const handleSubmit = async (input?: React.FormEvent | string) => {
        let msg = "";

        if (typeof input === "string") {
            msg = input;
        } else if (input) {
            input.preventDefault();
            msg = message;
        }

        if (!msg.trim()) return;

        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                content: msg,
                id: Math.random().toString(36).substr(2, 9)
            }
        ]);

        if (typeof input !== "string") setMessage("");

        setIsShowing(true);

        setTimeout(() => {
            scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: "smooth" });
        }, 0);

        try {
            const res = await fetch("http://localhost:8000/api/ai/consultation/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg }),
                credentials: "include",
            });
            const data = await res.json();
            setIsShowing(false);

            if (data.success) {
                if (data.summary) await simulateTyping((data.summary));
                else if (data.results) {
                    for (const result of data.results) {
                        await simulateTyping(`${result.field_name}:\n${(result.ai_reply)}`);
                    }
                } else if (data.ai_reply) {
                    await simulateTyping((data.ai_reply));
                }
            } else {
                await simulateTyping("Vui lòng đăng nhập để sử dụng chức năng này nhé 😅");
            }
        } catch {
            setIsShowing(false);
            await simulateTyping("Không kết nối được server 😢");
        }
    };

    const handleReset = () => {
        setMessages([]);
        setMessage("");
        setIsTyping(false);
    };

    const scrollToBottom = () => {
        scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: "smooth" });
    };


    return (
        <div className="fixed bottom-6 right-6 w-[90vw] max-w-[450px] h-[80vh] md:h-[600px] bg-white shadow-2xl rounded-xl border border-gray-200 flex flex-col z-[99999]">
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

            <div ref={scrollContainerRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-2 relative">
                {messages.length === 0 && (
                    <div className="text-gray-500 text-sm italic text-center mt-2">
                        🌱 Chào mừng bạn, hôm nay bạn muốn tìm hiểu gì?
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={msg.id || idx}
                        className={`px-3 py-2 rounded-xl max-w-[80%] whitespace-pre-wrap break-words
            ${msg.sender === "user"
                                ? "self-end bg-green-100 text-green-900"
                                : msg.sender === "ai"
                                    ? "self-start bg-gray-100 text-gray-900"
                                    : "self-start bg-gray-200 text-gray-800"
                            }`}
                    >
                        {msg.sender === "ai" ? (
                            <div
                                className="whitespace-pre-wrap break-words"
                                dangerouslySetInnerHTML={{
                                    __html: parseSimpleMarkdown(
                                        Array.isArray(msg.content) ? msg.content.join("\n") : msg.content
                                    ),
                                }}
                            />
                        ) : (
                            msg.content
                        )}


                    </div>
                ))}

                {isShowing && (
                    <div className="self-start px-3 py-2 bg-gray-100 text-gray-700 rounded-xl max-w-[60%] flex items-center gap-3">
                        <motion.div className="w-6 h-6" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full"></div>
                        </motion.div>
                    </div>
                )}

                {showScrollDown && (
                    <button
                        onClick={scrollToBottom}
                        className="fixed bottom-47 right-12 bg-green-50 text-green-700 p-3 rounded-full shadow-lg transition-all hover:bg-green-100 hover:scale-110 z-[100000]"
                        title="Cuộn xuống cuối"
                    >
                        <ChevronsDown size={24} />
                    </button>
                )}

            </div>

            <div className="flex overflow-x-auto gap-2 px-4 py-1 border-t border-gray-100">
                {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSubmit(suggestion)}
                        className="flex-shrink-0 bg-green-100 text-green-900 px-4 py-2 rounded-full hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isTyping || isShowing}
                    >
                        {suggestion}
                    </button>
                ))}
            </div>

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
                            if (!isTyping) {
                                handleSubmit(e);
                            }
                        }
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none overflow-y-auto scrollbar-none focus:outline-none focus:ring-2 focus:ring-green-400 max-h-[96px]"
                />
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isTyping || isShowing}
                    className="bg-green-600 text-white px-4 py-3 rounded-full hover:bg-green-700 transition-colors h-[48px] flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Gửi
                </button>
            </div>

        </div>
    );
}
