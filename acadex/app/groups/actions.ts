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

    // 1. Get IDs of groups the user belongs to
    const { data: myMemberships } = await supabaseServer
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

    if (!myMemberships || myMemberships.length === 0) return [];
    const groupIds = myMemberships.map(m => m.group_id);

    // 2. Fetch those groups (Bypassing RLS)
    const { data: groups, error: groupsError } = await supabaseServer
        .from("groups")
        .select("id, name, invite_code, creator_id")
        .in("id", groupIds);

    if (groupsError || !groups) {
        console.error("Fetch Groups Error:", groupsError);
        return [];
    }

    // 3. Fetch all members with their profiles for these groups
    const { data: allMembers, error: membersError } = await supabaseServer
        .from("group_members")
        .select("group_id, user_id, role")
        .in("group_id", groupIds);

    if (membersError || !allMembers) {
        console.error("Fetch Members Error:", membersError);
        return groups; // Return groups without members as fallback
    }

    // 4. Fetch profiles for all member user_ids
    const userIds = Array.from(new Set(allMembers.map(m => m.user_id)));
    const { data: profiles } = await supabaseServer
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

    const profileMap = (profiles || []).reduce((acc: any, p) => {
        acc[p.id] = p.username;
        return acc;
    }, {});

    // 5. Stitch it together
    return groups.map(g => ({
        ...g,
        group_members: allMembers
            .filter(m => m.group_id === g.id)
            .map(m => ({
                ...m,
                profiles: { username: profileMap[m.user_id] || "Unknown" }
            }))
    }));
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

export async function getGroupMessages(groupId: string) {
    const { data: messages, error } = await supabaseServer
        .from("group_messages")
        .select(`
            *,
            profiles(username)
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Fetch Messages Error:", error);
        return [];
    }

    return messages;
}

export async function sendGroupMessage(groupId: string, content: string) {
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

    const { error } = await supabaseServer
        .from("group_messages")
        .insert({
            group_id: groupId,
            user_id: user.id,
            content,
        });

    if (error) {
        console.error("Send Message Error:", error);
        return { error: "Failed to send message" };
    }

    return { success: true };
}

export async function getGroupMembers(groupId: string) {
    const { data, error } = await supabaseServer
        .from("group_members")
        .select(`
            id,
            user_id,
            role,
            joined_at,
            profiles(username)
        `)
        .eq("group_id", groupId);

    if (error) {
        console.error("Fetch Members Error:", error);
        return [];
    }

    return data;
}

export async function getGroupPageData(groupId: string) {
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

    const [group, members] = await Promise.all([
        getGroupById(groupId),
        getGroupMembers(groupId)
    ]);

    if (!group) return { error: "Group not found" };

    const userRole = members.find(m => m.user_id === user.id)?.role || null;

    // Check if user is a member
    if (!userRole && group.creator_id !== user.id) {
        // Optional: restriction logic here
    }

    return {
        group,
        members,
        userRole,
        user
    };
}

export async function getGroupMessage(messageId: number) {
    const { data: message, error } = await supabaseServer
        .from("group_messages")
        .select(`
            *,
            profiles(username)
        `)
        .eq("id", messageId)
        .single();

    if (error) {
        console.error("Fetch Single Message Error:", error);
        return null;
    }

    return message;
}
