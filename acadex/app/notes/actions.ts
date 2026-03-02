"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function voteNote(noteId: number, voteType: 1 | -1, path: string) {
    // 1. Get current user safely using cookies
    const supabaseAuth = await createClient();

    const {
        data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
        return { error: "User not authenticated" };
    }

    const adminClient = await createAdminClient();
    // 2. Perform DB operations using Admin Client (Bypass RLS)
    // Check if user has already voted
    const { data: existingVote, error: fetchError } = await adminClient
        .from("note_votes")
        .select("*")
        .eq("user_id", user.id)
        .eq("note_id", noteId)
        .single();

    if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching vote:", fetchError);
        return { error: "Failed to fetch existing vote" };
    }

    if (existingVote) {
        if (existingVote.vote_type === voteType) {
            // Toggle off (remove vote)
            const { error: deleteError } = await adminClient
                .from("note_votes")
                .delete()
                .eq("id", existingVote.id);

            if (deleteError) {
                console.error("Error deleting vote:", deleteError);
                return { error: "Failed to remove vote" };
            }
        } else {
            // Change vote (update)
            const { error: updateError } = await adminClient
                .from("note_votes")
                .update({ vote_type: voteType })
                .eq("id", existingVote.id);

            if (updateError) {
                console.error("Error updating vote:", updateError);
                return { error: "Failed to update vote" };
            }
        }
    } else {
        // New vote (insert)
        const { error: insertError } = await adminClient
            .from("note_votes")
            .insert({
                user_id: user.id,
                note_id: noteId,
                vote_type: voteType,
            });

        if (insertError) {
            console.error("Error inserting vote:", insertError);
            return { error: "Failed to submit vote" };
        }
    }

    revalidatePath(path);
    return { success: true };
}

export async function getNote(noteId: number) {
    const adminClient = await createAdminClient();
    const { data: note, error } = await adminClient
        .from("notes")
        .select(`
            id,
            title,
            content,
            course,
            topic,
            created_at,
            type,
            file_url,
            author_id,
            visibility,
            group_id,
            profiles(username)
        `)
        .eq("id", noteId)
        .single();

    if (error) {
        console.error("getNote error:", error);
        return { error: error.message };
    }

    return { note };
}

export async function updateNote(noteId: number, data: {
    title?: string;
    content?: string;
    course?: string;
    topic?: string;
    visibility?: string;
    group_id?: string | null;
}) {
    // 1. Auth check
    const supabaseAuth = await createClient();

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const adminClient = await createAdminClient();
    // 2. Fetch current note to verify ownership
    const { data: existingNote } = await adminClient
        .from("notes")
        .select("author_id")
        .eq("id", noteId)
        .single();

    if (!existingNote || existingNote.author_id !== user.id) {
        return { error: "You are not authorized to edit this note" };
    }

    // 3. Update note (Bypass RLS)
    const { error } = await adminClient
        .from("notes")
        .update(data)
        .eq("id", noteId);

    if (error) {
        console.error("updateNote error:", error);
        return { error: error.message };
    }

    revalidatePath(`/notes/${noteId}`);
    revalidatePath("/dashboard");
    return { success: true };
}
