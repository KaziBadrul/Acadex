"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Utility to generate a random 8-character invite code
function generateInviteCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function createGroup(name: string, password?: string) {
    const supabaseAuth = await createClient();

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const inviteCode = generateInviteCode();

    const adminClient = await createAdminClient();
    const { data, error } = await adminClient
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
    const { error: memberError } = await adminClient
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
    const supabaseAuth = await createClient();

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const adminClient = await createAdminClient();
    // 1. Find the group
    const { data: group, error: fetchError } = await adminClient
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
    const { error: joinError } = await adminClient
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
    const supabaseAuth = await createClient();

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return [];

    const adminClient = await createAdminClient();
    // 1. Get IDs of groups the user belongs to
    const { data: myMemberships } = await adminClient
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

    if (!myMemberships || myMemberships.length === 0) return [];
    const groupIds = myMemberships.map((m: { group_id: string }) => m.group_id);

    // 2. Fetch those groups (Bypassing RLS)
    const { data: groups, error: groupsError } = await adminClient
        .from("groups")
        .select("id, name, invite_code, creator_id")
        .in("id", groupIds);

    if (groupsError || !groups) {
        console.error("Fetch Groups Error:", groupsError);
        return [];
    }

    // 3. Fetch all members with their profiles for these groups
    const { data: allMembers, error: membersError } = await adminClient
        .from("group_members")
        .select("group_id, user_id, role")
        .in("group_id", groupIds);

    if (membersError || !allMembers) {
        console.error("Fetch Members Error:", membersError);
        return groups; // Return groups without members as fallback
    }

    // 4. Fetch profiles for all member user_ids
    const userIds = Array.from(new Set(allMembers.map((m: { user_id: string }) => m.user_id)));
    const { data: profiles } = await adminClient
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

    const profileMap = (profiles || []).reduce((acc: any, p: { id: string; username: string | null }) => {
        acc[p.id] = p.username;
        return acc;
    }, {});

    // 5. Stitch it together
    return groups.map((g: any) => ({
        ...g,
        group_members: allMembers
            .filter((m: any) => m.group_id === g.id)
            .map((m: any) => ({
                ...m,
                profiles: { username: profileMap[m.user_id] || "Unknown" }
            }))
    }));
}

export async function getGroupById(groupId: string) {
    const adminClient = await createAdminClient();
    const { data, error } = await adminClient
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

    if (error) {
        console.error("Fetch Group Error Detail:", error);
        return null;
    }

    // Normalize property names (database might have creator_id or created_by)
    return {
        ...data,
        name: data.name,
        description: data.description,
        invite_code: data.invite_code,
        creator_id: data.creator_id || data.created_by,
        created_at: data.created_at
    };
}

export async function getGroupMessages(groupId: string) {
    const adminClient = await createAdminClient();
    // 1. Fetch messages
    const { data: messages, error } = await adminClient
        .from("group_messages")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Fetch Messages Error:", error);
        return [];
    }

    if (!messages || messages.length === 0) return [];

    // 2. Fetch profiles
    const userIds = Array.from(new Set(messages.map(m => m.user_id)));
    const { data: profiles } = await adminClient
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

    const profileMap = (profiles || []).reduce((acc: any, p: any) => {
        acc[p.id] = p.username;
        return acc;
    }, {});

    // 3. Stitch
    return messages.map(msg => ({
        ...msg,
        profiles: { username: profileMap[msg.user_id] || "Unknown user" }
    }));
}

export async function sendGroupMessage(groupId: string, content: string) {
    const supabaseAuth = await createClient();

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const adminClient = await createAdminClient();
    const { error } = await adminClient
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
    const adminClient = await createAdminClient();
    // 1. Fetch memberships
    const { data: members, error } = await adminClient
        .from("group_members")
        .select("id, user_id, role, joined_at")
        .eq("group_id", groupId);

    if (error) {
        console.error("Fetch Members Error Detail:", error);
        return [];
    }

    if (!members || members.length === 0) return [];

    // 2. Fetch profiles
    const userIds = Array.from(new Set(members.map(m => m.user_id)));
    const { data: profiles } = await adminClient
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

    const profileMap = (profiles || []).reduce((acc: any, p: any) => {
        acc[p.id] = p.username;
        return acc;
    }, {});

    // 3. Stitch
    return members.map(m => ({
        ...m,
        profiles: { username: profileMap[m.user_id] || "Unknown user" }
    }));
}

export async function getGroupPageData(groupId: string) {
    const supabaseAuth = await createClient();

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const [group, members] = await Promise.all([
        getGroupById(groupId),
        getGroupMembers(groupId)
    ]);

    if (!group) return { error: "Group not found" };

    const userRole = members.find(m => m.user_id === user.id)?.role || null;

    // Check if user is a member
    const creatorId = (group as any).creator_id;
    if (!userRole && creatorId !== user.id) {
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
    const adminClient = await createAdminClient();
    // 1. Fetch message
    const { data: message, error } = await adminClient
        .from("group_messages")
        .select("*")
        .eq("id", messageId)
        .single();

    if (error || !message) {
        console.error("Fetch Single Message Error:", error);
        return null;
    }

    // 2. Fetch profile
    const { data: profile } = await adminClient
        .from("profiles")
        .select("username")
        .eq("id", message.user_id)
        .single();

    // 3. Stitch
    return {
        ...message,
        profiles: { username: profile?.username || "Unknown user" }
    };
}
