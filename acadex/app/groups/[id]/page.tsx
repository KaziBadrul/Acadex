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
}

interface Member {
    id: number;
    user_id: string;
    role: string;
    joined_at: string;
    profiles: {
        username: string;
    };
}

export default function GroupDetailPage({ params }: { params: { id: string } }) {
    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();
    const groupId = parseInt(params.id);

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

        // Fetch group details
        const { data: groupData } = await supabase
            .from("groups")
            .select("*")
            .eq("id", groupId)
            .single();

        if (groupData) {
            setGroup(groupData);
        }

        // Fetch members
        const { data: membersData } = await supabase
            .from("group_members")
            .select(
                `
        id,
        user_id,
        role,
        joined_at,
        profiles:user_id (
          username
        )
      `
            )
            .eq("group_id", groupId);

        if (membersData) {
            setMembers(membersData as any);

            // Find current user's role
            const currentMember = membersData.find((m: any) => m.user_id === user.id);
            if (currentMember) {
                setUserRole(currentMember.role);
            }
        }

        setLoading(false);
    };

    const removeMember = async (memberId: number) => {
        if (!confirm("Are you sure you want to remove this member?")) return;

        const { error } = await supabase
            .from("group_members")
            .delete()
            .eq("id", memberId);

        if (error) {
            alert("Error removing member: " + error.message);
        } else {
            fetchData();
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-lg">Loading Group...</div>;
    }

    if (!group) {
        return (
            <div className="p-12 text-center">
                <p className="text-xl text-gray-600 mb-4">Group not found</p>
                <Link
                    href="/groups"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Back to Groups
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">{group.name}</h1>
                        {group.description && (
                            <p className="text-gray-600 mt-2">{group.description}</p>
                        )}
                    </div>
                    <Link
                        href="/groups"
                        className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
                    >
                        Back to Groups
                    </Link>
                </div>

                {/* Members Section */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Members ({members.length})
                    </h2>

                    <div className="space-y-3">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {member.profiles?.username || "Unknown User"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Joined {new Date(member.joined_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span
                                        className={`px-3 py-1 text-xs font-semibold rounded ${member.role === "admin"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {member.role.toUpperCase()}
                                    </span>

                                    {userRole === "admin" && member.user_id !== user?.id && (
                                        <button
                                            onClick={() => removeMember(member.id)}
                                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coming Soon Section */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                        🚀 Coming Soon
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1 ml-4">
                        <li>• Invite members via email or username</li>
                        <li>• Share notes within the group</li>
                        <li>• Group chat and discussions</li>
                        <li>• Collaborative note editing</li>
                        <li>• Group assignments and tasks</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
