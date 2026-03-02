"use client";

import { useEffect, useState, useCallback } from "react";
import { addComment, getComments, voteComment } from "@/app/notes/comments-actions";
import { usePathname } from "next/navigation";
import { MessageSquare, Send, ThumbsUp, ThumbsDown, User as UserIcon, Clock } from "lucide-react";

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    username: string;
    up: number;
    down: number;
    userVote: number | null;
}

export default function CommentSection({ noteId, currentUser }: { noteId: number, currentUser: any }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const pathname = usePathname();

    const loadComments = useCallback(async () => {
        setLoading(true);
        const data = await getComments(noteId);
        setComments(data as Comment[]);
        setLoading(false);
    }, [noteId]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setSubmitting(true);
        const res = await addComment(noteId, content);
        if (res.error) {
            alert(res.error);
        } else {
            setContent("");
            loadComments();
        }
        setSubmitting(false);
    };

    const handleVote = async (commentId: string, type: 1 | -1) => {
        if (!currentUser) {
            alert("Please log in to vote.");
            return;
        }
        await voteComment(commentId, type, pathname);
        loadComments();
    };

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/70">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-primary tracking-tight">
                    Comments <span className="text-primary/40 font-medium ml-1">({comments.length})</span>
                </h2>
            </div>

            {currentUser ? (
                <form onSubmit={handleSubmit} className="mb-12">
                    <div className="bg-background/50 border border-muted/30 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-accent focus-within:border-accent transition-all shadow-sm">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Add to the discussion..."
                            className="w-full p-4 bg-transparent outline-none resize-none text-primary placeholder:text-muted min-h-[100px]"
                            required
                        />
                        <div className="flex justify-end p-2 border-t border-muted/10">
                            <button
                                type="submit"
                                disabled={submitting || !content.trim()}
                                className="flex items-center gap-2 bg-primary text-white font-medium py-2 px-5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:hover:bg-primary"
                            >
                                {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                                {submitting ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-muted/5 border border-muted/20 p-6 rounded-2xl text-center text-primary/60 mb-12 flex flex-col items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-muted mb-3 opacity-50" />
                    <p className="font-medium">Sign in to join the discussion</p>
                </div>
            )}

            <div className="space-y-6">
                {loading && comments.length === 0 ? (
                    <div className="space-y-6 animate-pulse">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-muted/20 shrink-0"></div>
                                <div className="space-y-3 flex-1">
                                    <div className="h-4 w-32 bg-muted/20 rounded-md"></div>
                                    <div className="h-16 w-full bg-muted/10 rounded-xl"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-primary/30" />
                        </div>
                        <p className="text-primary/50 text-sm font-medium">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    comments.map((c) => (
                        <div key={c.id} className="flex gap-4 group">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground shrink-0 mt-1 shadow-subtle">
                                <UserIcon className="w-5 h-5" />
                            </div>

                            <div className="flex-1">
                                <div className="bg-muted/5 border border-muted/20 p-5 rounded-2xl rounded-tl-sm shadow-sm transition-all hover:border-muted/30 hover:shadow-subtle">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-primary tracking-tight">{c.username}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-primary/40 font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <p className="text-primary/80 break-words whitespace-pre-wrap text-[15px] leading-relaxed mb-4">{c.content}</p>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleVote(c.id, 1)}
                                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors text-xs font-medium ${c.userVote === 1 ? 'bg-primary border-primary text-white' : 'text-primary/50 hover:bg-muted/10 hover:text-primary'}`}
                                        >
                                            <ThumbsUp className={`w-3.5 h-3.5 ${c.userVote === 1 ? 'fill-white' : ''}`} />
                                            <span>{c.up}</span>
                                        </button>

                                        <button
                                            onClick={() => handleVote(c.id, -1)}
                                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors text-xs font-medium ${c.userVote === -1 ? 'bg-red-50 text-red-600 border border-red-200' : 'text-primary/50 hover:bg-muted/10 hover:text-red-500'}`}
                                        >
                                            <ThumbsDown className="w-3.5 h-3.5" />
                                            <span>{c.down}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
