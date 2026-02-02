"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function voteNote(noteId: number, voteType: 1 | -1, path: string) {
    // 1. Get current user safely using cookies
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    // We are in a server action, this is fine
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
        return { error: "User not authenticated" };
    }

    // 2. Perform DB operations using Admin Client (Bypass RLS)
    // Check if user has already voted
    const { data: existingVote, error: fetchError } = await supabaseServer
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
            const { error: deleteError } = await supabaseServer
                .from("note_votes")
                .delete()
                .eq("id", existingVote.id);

            if (deleteError) {
                console.error("Error deleting vote:", deleteError);
                return { error: "Failed to remove vote" };
            }
        } else {
            // Change vote (update)
            const { error: updateError } = await supabaseServer
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
        const { error: insertError } = await supabaseServer
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
