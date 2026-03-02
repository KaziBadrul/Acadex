"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getGroupMessages, sendGroupMessage } from "@/app/groups/actions";

interface Message {
    id: number;
    content: string;
    created_at: string;
    user_id: string;
    profiles?: { username: string };
}

interface GroupChatProps {
    groupId: string;
    currentUserId: string;
}

export default function GroupChat({ groupId, currentUserId }: GroupChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        async function loadMessages() {
            const initialMessages = await getGroupMessages(groupId);
            setMessages(initialMessages);
            setLoading(false);
            scrollToBottom();
        }

        loadMessages();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`group_chat_${groupId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "group_messages",
                    filter: `group_id=eq.${groupId}`,
                },
                async (payload) => {
                    // Fetch message via server action to bypass RLS for profile info
                    const { getGroupMessage } = await import("@/app/groups/actions");
                    const fullMessage = await getGroupMessage(payload.new.id);

                    if (fullMessage) {
                        setMessages((prev) => {
                            // Prevent duplicates
                            if (prev.find(m => m.id === fullMessage.id)) return prev;
                            return [...prev, fullMessage as Message];
                        });
                        scrollToBottom();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [groupId, supabase]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const content = newMessage.trim();
        setNewMessage("");

        const res = await sendGroupMessage(groupId, content);
        if (res.error) {
            alert(res.error);
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading Study Room...</div>;
    }

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                    <span>💬</span> Group Study Messenger
                </h3>
                <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">Real-time</span>
            </div>

            {/* Message List */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                        <span className="text-4xl">📚</span>
                        <p>No messages yet. Start the discussion!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.user_id === currentUserId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {!isMe && (
                                        <span className="text-xs font-bold text-gray-600">
                                            {msg.profiles?.username || (msg as any).profiles?.username || "Unknown user"}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm transition-all ${isMe
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
