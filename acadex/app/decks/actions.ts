// app/decks/actions.ts
"use server";

import { createAdminClient, createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getDeck(deckId: number) {
    const admin = await createAdminClient();
    const { data: deck, error } = await admin
        .from("flashcard_decks")
        .select(`*, flashcards(*)`)
        .eq("id", deckId)
        .single();

    if (error) {
        console.error("getDeck error:", error);
        return { error: error.message };
    }

    return { deck };
}

export async function deleteDeck(deckId: number) {
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const admin = await createAdminClient();

    // Verify ownership before deleting
    const { data: deck } = await admin
        .from("flashcard_decks")
        .select("created_by, note_id")
        .eq("id", deckId)
        .single();

    if (!deck || (deck.created_by && deck.created_by !== user.id)) {
        return { error: "Unauthorized or deck not found" };
    }

    const { error } = await admin
        .from("flashcard_decks")
        .delete()
        .eq("id", deckId);

    if (error) {
        console.error("deleteDeck error:", error);
        return { error: error.message };
    }

    if (deck.note_id) {
        revalidatePath(`/notes/${deck.note_id}`);
    }
    revalidatePath("/dashboard");
    return { success: true };
}
