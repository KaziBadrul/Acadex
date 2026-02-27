// components/ResourceComments.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import CommentForm from "./CommentForm";

interface Comment {
    id: number;
    content: string;
    created_at: string;
    user_id: string;
    profiles: { username: string } | { username: string }[] | null;
}

interface ResourceCommentsProps {
    resourceId: number;
}

export default function ResourceComments({ resourceId }: ResourceCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchComments();
        getCurrentUser();
    }, [resourceId]);

    const getCurrentUser = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
    };

    const fetchComments = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/comments/resource/${resourceId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch comments");
            }

            setComments(data.comments || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateComment = async (content: string) => {
        try {
            const response = await fetch(`/api/comments/resource/${resourceId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create comment");
            }

            // Add new comment to the list
            setComments([data.comment, ...comments]);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to create comment");
            throw err;
        }
    };

    const handleUpdateComment = async (commentId: number, content: string) => {
        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update comment");
            }

            // Update comment in the list
            setComments(
                comments.map((c) => (c.id === commentId ? data.comment : c))
            );
            setEditingCommentId(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update comment");
            throw err;
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete comment");
            }

            // Remove comment from the list
            setComments(comments.filter((c) => c.id !== commentId));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete comment");
        }
    };

    const getUsername = (comment: Comment): string => {
        if (Array.isArray(comment.profiles)) {
            return comment.profiles[0]?.username || "Unknown User";
        }
        return comment.profiles?.username || "Unknown User";
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading comments...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Comments</h2>

            {/* Comment Form */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">Leave a comment</h3>
                <CommentForm onSubmit={handleCreateComment} />
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
                        No comments yet. Be the first to comment!
                    </div>
                ) : (
                    comments.map((comment) => {
                        const isOwner = currentUserId === comment.user_id;
                        const isEditing = editingCommentId === comment.id;

                        return (
                            <div
                                key={comment.id}
                                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-semibold text-blue-600">
                                            {getUsername(comment)}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-2">
                                            {new Date(comment.created_at).toLocaleString()}
                                        </span>
                                    </div>

                                    {isOwner && !isEditing && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingCommentId(comment.id)}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-sm text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isEditing ? (
                                    <CommentForm
                                        onSubmit={(content) => handleUpdateComment(comment.id, content)}
                                        initialValue={comment.content}
                                        submitLabel="Update"
                                        onCancel={() => setEditingCommentId(null)}
                                    />
                                ) : (
                                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
