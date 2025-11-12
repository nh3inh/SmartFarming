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

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-20 right-6 w-16 h-16 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors z-[99999]"
                    title="Chat với AI"
                >
                    <Bot size={28} />
                </button>
            )}

            {isOpen && <AIChatPopup onClose={() => setIsOpen(false)} messages={messages} setMessages={setMessages} />}
        </>
    );
}
