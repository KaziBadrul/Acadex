"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { generateQAFromText } from "@/lib/gemini";
import { heuristicGenerate } from "@/lib/flashcards";

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
            version,
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

export async function getNotes() {
    const adminClient = await createAdminClient();
    const { data: notes, error } = await adminClient
        .from("notes")
        .select(`
            id,
            title,
            course,
            topic,
            created_at,
            type,
            author_id,
            visibility,
            group_id,
            groups(id, name),
            profiles(username)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getNotes error:", error);
        return { error: error.message };
    }

    return { notes };
}

// ---------- flashcard support ----------

export type FlashcardResult =
    | { deck: any }
    | { error: string };

export async function generateFlashcards(noteId: number): Promise<FlashcardResult> {
    // require authenticated user
    const supabaseAuth = await createClient();
    const {
        data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user) {
        return { error: "Not authenticated" };
    }

    const adminClient = await createAdminClient();
    const { data: note, error: fetchError } = await adminClient
        .from("notes")
        .select("title,content")
        .eq("id", noteId)
        .single();

    if (fetchError || !note) {
        console.error("generateFlashcards fetch note error", fetchError);
        return { error: "Note not found" };
    }

    let qaPairs = [];
    // first attempt an LLM call; will be empty if no key or failure
    qaPairs = await generateQAFromText(note.content || "");
    if (!qaPairs.length) {
        // fallback to a simple heuristic so the feature still works offline
        qaPairs = heuristicGenerate(note.content || "");
    }

    // Insert the deck using the admin client
    const { data: deck, error: insertDeckError } = await adminClient
        .from("flashcard_decks")
        .insert({
            note_id: noteId,
            title: `Deck from ${note.title}`,
            created_by: user.id,
        })
        .select()
        .single();

    if (insertDeckError || !deck) {
        console.error("error creating deck. Full error:", JSON.stringify(insertDeckError, null, 2));
        if (insertDeckError?.code === "PGRST205") {
            console.error("HINT: The table 'flashcard_decks' was not found. Please ensure you have run the migration 'migrations/04_add_flashcards.sql' in your Supabase SQL editor.");
        }
        console.error("Attempted data:", { noteId, userId: user.id });

        // If it failed because of foreign key on created_by (e.g. profile doesn't exist)
        // try one more time without created_by
        if (insertDeckError?.code === "23503" && (insertDeckError as any).details?.includes("created_by")) {
            const { data: deckNoUser, error: retryError } = await adminClient
                .from("flashcard_decks")
                .insert({
                    note_id: noteId,
                    title: `Deck from ${note.title} (profile-less)`,
                })
                .select()
                .single();

            if (!retryError && deckNoUser) {
                // Succeeded without user, continue with this deck
                return await finalizeDeck(adminClient, deckNoUser, qaPairs, noteId);
            }
        }

        return { error: `Failed to create deck: ${insertDeckError?.message || "Unknown database error"}` };
    }

    return await finalizeDeck(adminClient, deck, qaPairs, noteId);
}

async function finalizeDeck(adminClient: any, deck: any, qaPairs: any[], noteId: number) {
    const cards = qaPairs.map((p) => ({
        deck_id: deck.id,
        question: p.q,
        answer: p.a,
    }));

    const { error: insertCardsError } = await adminClient
        .from("flashcards")
        .insert(cards);

    if (insertCardsError) {
        console.error("error inserting cards", JSON.stringify(insertCardsError, null, 2));
        return { error: "Failed to insert cards" };
    }

    revalidatePath(`/notes/${noteId}`);
    return { deck };
}
