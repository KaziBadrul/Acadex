"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getGroupMessages, sendGroupMessage, getGroupMessage } from "@/app/groups/actions";
import { MessageSquare, Send } from "lucide-react";

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
            try {
                const initialMessages = await getGroupMessages(groupId);
                setMessages(initialMessages);
            } catch (error) {
                console.error("Failed to load messages:", error);
            } finally {
                setLoading(false);
                setTimeout(scrollToBottom, 100);
            }
        }

        loadMessages();

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
                    const fullMessage = await getGroupMessage(payload.new.id);

                    if (fullMessage) {
                        setMessages((prev) => {
                            if (prev.find(m => m.id === fullMessage.id)) return prev;
                            return [...prev, fullMessage as Message];
                        });
                        setTimeout(scrollToBottom, 100);
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
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 bg-background/50 backdrop-blur-sm z-10">
                <span className="w-8 h-8 border-4 border-muted/30 border-t-primary rounded-full animate-spin mb-4" />
                <p className="font-medium text-primary/60 animate-pulse">Connecting to study room...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col absolute inset-0 bg-background rounded-b-2xl overflow-hidden">
            {/* Header (Optional, if we want an inner header. The parent already provides one so we skip the big blue bar) */}

            {/* Message List */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6 custom-scrollbar"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-primary/40 space-y-4 max-w-sm mx-auto text-center">
                        <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-sm font-medium">No messages yet. Be the first to start the discussion!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.user_id === currentUserId;
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const showHeader = !prevMsg || prevMsg.user_id !== msg.user_id ||
                            (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60 * 1000); // 5 mins gap

                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"} ${showHeader ? 'mt-6' : 'mt-1'}`}
                            >
                                {showHeader && (
                                    <div className={`flex items-baseline gap-2 mb-1.5 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                        {!isMe && (
                                            <span className="text-xs font-bold text-primary/70">
                                                {Array.isArray(msg.profiles)
                                                    ? (msg.profiles[0]?.username || "Unknown user")
                                                    : (msg.profiles?.username || "Unknown user")}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-medium text-primary/40">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                                <div
                                    className={`max-w-[75%] px-4 py-2.5 text-sm shadow-sm transition-all relative ${isMe
                                        ? "bg-primary text-background rounded-2xl rounded-tr-sm"
                                        : "bg-card text-primary border border-muted/20 rounded-2xl rounded-tl-sm"
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
            <form onSubmit={handleSendMessage} className="p-4 bg-card border-t border-muted/20 flex gap-3 items-end shrink-0">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 bg-muted/5 border border-muted/20 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none text-primary placeholder:text-muted transition-all"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary text-white p-3 rounded-xl shadow-sm transition-all flex items-center justify-center shrink-0 h-12 w-12"
                >
                    <Send className="w-5 h-5 ml-0.5" />
                </button>
            </form>
        </div>
    );
}
