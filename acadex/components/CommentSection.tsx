"use client";

import { useEffect, useState, useCallback } from "react";
import { addComment, getComments, voteComment } from "@/app/notes/comments-actions";
import { usePathname } from "next/navigation";

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
        <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                💬 Comments ({comments.length})
            </h2>

            {currentUser ? (
                <form onSubmit={handleSubmit} className="mb-10">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your thoughts on this note..."
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none text-black"
                        rows={3}
                        required
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                            {submitting ? "Posting..." : "Post Comment"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center text-gray-500 mb-10">
                    Please log in to leave a comment.
                </div>
            )}

            <div className="space-y-6">
                {loading && comments.length === 0 ? (
                    <p className="text-center text-gray-500 italic">Loading comments...</p>
                ) : comments.length === 0 ? (
                    <p className="text-center text-gray-400 italic py-4">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map((c) => (
                        <div key={c.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition hover:shadow-md">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-blue-600">@{c.username}</span>
                                <span className="text-xs text-gray-400">
                                    {new Date(c.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-800 break-words mb-4 whitespace-pre-wrap">{c.content}</p>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                                    <button
                                        onClick={() => handleVote(c.id, 1)}
                                        className={`p-1.5 rounded-md transition ${c.userVote === 1 ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
                                    >
                                        👍 <span className="text-xs font-bold font-mono">{c.up}</span>
                                    </button>
                                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                    <button
                                        onClick={() => handleVote(c.id, -1)}
                                        className={`p-1.5 rounded-md transition ${c.userVote === -1 ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                                    >
                                        👎 <span className="text-xs font-bold font-mono">{c.down}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
