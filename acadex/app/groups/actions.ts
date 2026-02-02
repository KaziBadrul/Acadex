"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Utility to generate a random 8-character invite code
function generateInviteCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function createGroup(name: string, password?: string) {
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { }
                },
            },
        }
    );

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const inviteCode = generateInviteCode();

    const { data, error } = await supabaseServer
        .from("groups")
        .insert({
            name,
            creator_id: user.id,
            invite_code: inviteCode,
            password: password || null,
        })
        .select()
        .single();

    if (error) {
        console.error("Create Group Error:", error);
        return { error: "Failed to create group" };
    }

    // Automatically add creator as admin member
    const { error: memberError } = await supabaseServer
        .from("group_members")
        .insert({
            group_id: data.id,
            user_id: user.id,
            role: "admin",
        });

    if (memberError) {
        console.error("Member Insert Error:", memberError);
    }

    revalidatePath("/groups");
    return { success: true, group: data };
}

export async function joinGroup(inviteCode: string, password?: string) {
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { }
                },
            },
        }
    );

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // 1. Find the group
    const { data: group, error: fetchError } = await supabaseServer
        .from("groups")
        .select("*")
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

    if (fetchError || !group) return { error: "Group not found" };

    // 2. Validate password if group has one
    if (group.password && group.password !== password) {
        return { error: "Invalid password" };
    }

    // 3. Add user as member
    const { error: joinError } = await supabaseServer
        .from("group_members")
        .insert({
            group_id: group.id,
            user_id: user.id,
            role: "member",
        });

    if (joinError) {
        if (joinError.code === "23505") return { error: "You are already a member" };
        console.error("Join Group Error:", joinError);
        return { error: "Failed to join group" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/groups");
    return { success: true };
}

export async function fetchUserGroups() {
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { }
                },
            },
        }
    );

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return [];

    const { data: memberships, error } = await supabaseServer
        .from("group_members")
        .select(`
      group_id,
      groups (
        id,
        name,
        invite_code
      )
    `)
        .eq("user_id", user.id);

    if (error) {
        console.error("Fetch Groups Error:", error);
        return [];
    }

    return memberships.map((m: any) => m.groups);
}

export async function getGroupById(groupId: string) {
    const { data, error } = await supabaseServer
        .from("groups")
        .select("id, name, invite_code")
        .eq("id", groupId)
        .single();

    if (error) {
        console.error("Fetch Group Error:", error);
        return null;
    }

    return data;
}
