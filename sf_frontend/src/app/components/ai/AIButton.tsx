"use client";

import React, { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import AIChatPopup, { ChatMessage } from "./AIChatPopup";
import { usePathname } from "next/navigation";

export default function AIButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const pathname = usePathname();

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const tick = () => {
            setMessages(prev => {
                const now = Date.now();
                let changed = false;

                const next = prev.map(m => {
                    if (m.sender !== "ai" || !m.fullText || m.completed) return m;

                    const charsToShow = 3;
                    const newContent = m.fullText.slice(0, m.content.length + charsToShow);
                    const completed = newContent.length >= m.fullText.length;

                    if (newContent !== m.content) {
                        if (completed && m.onComplete) m.onComplete();
                        changed = true;
                        return { ...m, content: newContent, completed };
                    }
                    return m;
                });

                return changed ? next : prev;
            });
        };

        const interval = setInterval(tick, 16);
        const handleVisibility = () => tick();
        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("focus", handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("focus", handleVisibility);
        };
    }, []);

    const startSimulateTyping = (text: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        const duration = Math.max(100, text.length * 3);

        setMessages(prev => [
            ...prev,
            {
                id,
                sender: "ai",
                content: "",
                fullText: text,
                startedAt: Date.now(),
                durationMs: duration,
                completed: false,
            }
        ]);
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-20 right-6 w-16 h-16 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors z-[99999]"
                >
                    <Bot size={28} />
                </button>
            )}

            {isOpen && (
                <AIChatPopup
                    onClose={() => setIsOpen(false)}
                    messages={messages}
                    setMessages={setMessages}
                    startSimulateTyping={startSimulateTyping}
                />
            )}
        </>
    );
}
