"use server";

import { createAdminClient } from "@/utils/supabase/server";

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
