"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Group {
    id: number;
    name: string;
    description: string;
    created_by: string;
    created_at: string;
    member_count?: number;
    user_role?: string;
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDescription, setNewGroupDescription] = useState("");
    const [creating, setCreating] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            router.push("/login");
            return;
        }

        setUser({ id: user.id });

        // Fetch groups the user is a member of
        const { data: membershipData } = await supabase
            .from("group_members")
            .select(
                `
        role,
        groups (
          id,
          name,
          description,
          created_by,
          created_at
        )
      `
            )
            .eq("user_id", user.id);

        if (membershipData) {
            const groupsWithRole = membershipData.map((m: any) => ({
                ...m.groups,
                user_role: m.role,
            }));
            setGroups(groupsWithRole);
        }

        setLoading(false);
    };

    const createGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newGroupName.trim()) return;

        setCreating(true);

        // Create the group
        const { data: newGroup, error: groupError } = await supabase
            .from("groups")
            .insert({
                name: newGroupName.trim(),
                description: newGroupDescription.trim(),
                created_by: user.id,
            })
            .select()
            .single();

        if (groupError) {
            alert("Error creating group: " + groupError.message);
            setCreating(false);
            return;
        }

        // Add creator as admin member
        const { error: memberError } = await supabase.from("group_members").insert({
            group_id: newGroup.id,
            user_id: user.id,
            role: "admin",
        });

        if (memberError) {
            alert("Error adding member: " + memberError.message);
            setCreating(false);
            return;
        }

        // Reset form and refresh
        setNewGroupName("");
        setNewGroupDescription("");
        setShowCreateForm(false);
        setCreating(false);
        fetchData();
    };

    const deleteGroup = async (groupId: number) => {
        if (!confirm("Are you sure you want to delete this group?")) return;

        const { error } = await supabase.from("groups").delete().eq("id", groupId);

        if (error) {
            alert("Error deleting group: " + error.message);
        } else {
            fetchData();
        }
    };

    const leaveGroup = async (groupId: number) => {
        if (!user) return;
        if (!confirm("Are you sure you want to leave this group?")) return;

        const { error } = await supabase
            .from("group_members")
            .delete()
            .eq("group_id", groupId)
            .eq("user_id", user.id);

        if (error) {
            alert("Error leaving group: " + error.message);
        } else {
            fetchData();
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-lg">Loading Groups...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-4xl font-bold text-gray-900">👥 My Groups</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition"
                        >
                            ➕ Create Group
                        </button>
                        <Link
                            href="/dashboard"
                            className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Create Group Form */}
                {showCreateForm && (
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Create New Group
                        </h2>
                        <form onSubmit={createGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Group Name *
                                </label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="e.g. Math Study Group"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newGroupDescription}
                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                    placeholder="What is this group about?"
                                    rows={3}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {creating ? "Creating..." : "Create Group"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Groups List */}
                {groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groups.map((group) => (
                            <div
                                key={group.id}
                                className="bg-white p-5 rounded-lg shadow hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {group.name}
                                    </h3>
                                    {group.user_role === "admin" && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                            ADMIN
                                        </span>
                                    )}
                                </div>

                                {group.description && (
                                    <p className="text-gray-600 text-sm mb-3">
                                        {group.description}
                                    </p>
                                )}

                                <p className="text-xs text-gray-500 mb-4">
                                    Created {new Date(group.created_at).toLocaleDateString()}
                                </p>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/groups/${group.id}`}
                                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm text-center rounded hover:bg-blue-600 transition"
                                    >
                                        View
                                    </Link>
                                    {group.user_role === "admin" ? (
                                        <button
                                            onClick={() => deleteGroup(group.id)}
                                            className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                                        >
                                            Delete
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => leaveGroup(group.id)}
                                            className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition"
                                        >
                                            Leave
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-10 rounded-lg shadow text-center">
                        <p className="text-gray-500 text-lg mb-4">
                            You're not a member of any groups yet.
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                        >
                            Create Your First Group
                        </button>
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                        📝 About Groups
                    </h3>
                    <p className="text-sm text-blue-800">
                        Groups allow you to collaborate with other students. Create study
                        groups, share notes, and work together on assignments.
                    </p>
                </div>
            </div>
        </div>
    );
}
