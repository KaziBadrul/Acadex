"use client";

import { useState, useEffect } from "react";
import { voteNote } from "@/app/notes/actions";
import { createClient } from "@/utils/supabase/client";
import { usePathname } from "next/navigation";

interface VoteButtonsProps {
    noteId: number;
    initialUpvotes?: number;
    initialDownvotes?: number;
    initialUserVote?: 1 | -1 | null;
}

export default function VoteButtons({
    noteId,
    initialUpvotes,
    initialDownvotes,
    initialUserVote = null
}: VoteButtonsProps) {
    // If props are passed (even if 0), we assume loading is done
    const isPreloaded = initialUpvotes !== undefined && initialDownvotes !== undefined;

    const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote);
    const [upvotes, setUpvotes] = useState(initialUpvotes || 0);
    const [downvotes, setDownvotes] = useState(initialDownvotes || 0);
    const [loading, setLoading] = useState(!isPreloaded);

    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        // Only fetch if NOT preloaded
        if (isPreloaded) {
            setLoading(false);
            return;
        }

        async function fetchVotes() {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Fetch total upvotes/downvotes
            const { count: upCount, error: upError } = await supabase
                .from("note_votes")
                .select("*", { count: "exact", head: true })
                .eq("note_id", noteId)
                .eq("vote_type", 1);

            const { count: downCount, error: downError } = await supabase
                .from("note_votes")
                .select("*", { count: "exact", head: true })
                .eq("note_id", noteId)
                .eq("vote_type", -1);

            if (!upError) setUpvotes(upCount || 0);
            if (!downError) setDownvotes(downCount || 0);

            // 2. Fetch user's vote if logged in
            if (user) {
                const { data: myVote } = await supabase
                    .from("note_votes")
                    .select("vote_type")
                    .eq("note_id", noteId)
                    .eq("user_id", user.id)
                    .single();

                if (myVote) setUserVote(myVote.vote_type as 1 | -1);
            }

            setLoading(false);
        }

        fetchVotes();
    }, [noteId, supabase, isPreloaded]);

    const handleVote = async (type: 1 | -1) => {
        // Optimistic update
        const previousVote = userVote;
        const previousUpvotes = upvotes;
        const previousDownvotes = downvotes;

        // Toggle logic
        if (userVote === type) {
            // Removing vote
            setUserVote(null);
            if (type === 1) setUpvotes((p) => Math.max(0, p - 1));
            else setDownvotes((p) => Math.max(0, p - 1));
        } else {
            // Changing/Setting vote
            setUserVote(type);
            if (type === 1) {
                setUpvotes((p) => p + 1);
                if (previousVote === -1) setDownvotes((p) => Math.max(0, p - 1));
            } else {
                setDownvotes((p) => p + 1);
                if (previousVote === 1) setUpvotes((p) => Math.max(0, p - 1));
            }
        }

        // Call server action
        const result = await voteNote(noteId, type, pathname);

        if (result.error) {
            // Revert on error
            console.error(result.error);
            setUserVote(previousVote);
            setUpvotes(previousUpvotes);
            setDownvotes(previousDownvotes);
            alert("Failed to submit vote");
        }
    };

    if (loading) return <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>;

    return (
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
                onClick={() => handleVote(1)}
                className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${userVote === 1
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "text-gray-600 hover:bg-gray-200"
                    }`}
                title="Upvote"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 15l-6-6-6 6" />
                </svg>
                <span className="font-medium text-sm">{upvotes}</span>
            </button>

            <div className="w-px h-4 bg-gray-300"></div>

            <button
                onClick={() => handleVote(-1)}
                className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${userVote === -1
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "text-gray-600 hover:bg-gray-200"
                    }`}
                title="Downvote"
            >
                <span className="font-medium text-sm">{downvotes}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>
        </div>
    );
}
