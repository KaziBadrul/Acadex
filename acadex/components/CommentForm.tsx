// components/CommentForm.tsx
"use client";

import { useState } from "react";

interface CommentFormProps {
    onSubmit: (content: string) => Promise<void>;
    initialValue?: string;
    placeholder?: string;
    submitLabel?: string;
    onCancel?: () => void;
}

export default function CommentForm({
    onSubmit,
    initialValue = "",
    placeholder = "Write your comment...",
    submitLabel = "Submit",
    onCancel,
}: CommentFormProps) {
    const [content, setContent] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(content);
            setContent(""); // Clear form after successful submission
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
            />

            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    {content.length} characters
                </span>

                <div className="flex gap-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Submitting..." : submitLabel}
                    </button>
                </div>
            </div>
        </form>
    );
}
