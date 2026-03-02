"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addComment(noteId: number, content: string) {
    const supabaseAuth = await createClient();

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const adminClient = await createAdminClient();
    // 1. Verify note visibility (Bypass RLS)
    const { data: note, error: noteError } = await adminClient
        .from("notes")
        .select("visibility")
        .eq("id", noteId)
        .single();

    if (noteError || !note) {
        return { error: "Note not found" };
    }

    if (note.visibility === "private") {
        return { error: "Comments are disabled for private notes" };
    }

    // 2. Insert comment
    const { error } = await adminClient
        .from("note_comments")
        .insert({
            note_id: noteId,
            user_id: user.id,
            content: content.trim(),
        });

    if (error) {
        console.error("addComment error:", error);
        return { error: "Failed to post comment" };
    }

    revalidatePath(`/notes/${noteId}`);
    return { success: true };
}

export async function getComments(noteId: number) {
    const supabaseAuth = await createClient();

    const { data: { user } } = await supabaseAuth.auth.getUser();

    const adminClient = await createAdminClient();
    // 1. Fetch comments (Bypassing RLS)
    const { data: comments, error } = await adminClient
        .from("note_comments")
        .select("id, content, created_at, user_id")
        .eq("note_id", noteId)
        .order("created_at", { ascending: true });

    if (error || !comments) {
        console.error("getComments error:", error);
        return [];
    }

    if (comments.length === 0) return [];

    // 2. Fetch profiles for these users
    const userIds = Array.from(new Set(comments.map((c: any) => c.user_id)));
    const { data: profiles } = await adminClient
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

    const profileMap = (profiles || []).reduce((acc: Record<string, string | null>, p: any) => {
        acc[p.id] = p.username;
        return acc;
    }, {});

    // 2. Fetch votes for these comments
    const commentIds = comments.map((c: any) => c.id);
    if (commentIds.length === 0) return [];

    const { data: votes } = await adminClient
        .from("comment_votes")
        .select("*")
        .in("comment_id", commentIds);

    const voteData: Record<string, { up: number; down: number; userVote: number | null }> = {};
    commentIds.forEach(id => {
        voteData[id] = { up: 0, down: 0, userVote: null };
    });

    votes?.forEach((v: any) => {
        if (!voteData[v.comment_id]) return;
        if (v.vote_type === 1) voteData[v.comment_id].up++;
        else if (v.vote_type === -1) voteData[v.comment_id].down++;

        if (user && v.user_id === user.id) {
            voteData[v.comment_id].userVote = v.vote_type;
        }
    });

    return comments.map((c: any) => ({
        ...c,
        ...voteData[c.id],
        username: profileMap[c.user_id] || "Unknown"
    }));
}

export async function voteComment(commentId: string, voteType: 1 | -1, path: string) {
    const supabaseAuth = await createClient();

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const adminClient = await createAdminClient();
    // 1. Check existing vote
    const { data: existingVote } = await adminClient
        .from("comment_votes")
        .select("*")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .single();

    if (existingVote) {
        if (existingVote.vote_type === voteType) {
            // Unvote
            await adminClient.from("comment_votes").delete().eq("id", existingVote.id);
        } else {
            // Change vote
            await adminClient.from("comment_votes").update({ vote_type: voteType }).eq("id", existingVote.id);
        }
    } else {
        // New vote
        await adminClient.from("comment_votes").insert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: voteType
        });
    }

    revalidatePath(path);
    return { success: true };
}
