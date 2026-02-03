"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import GroupChat from "@/components/GroupChat";

interface Group {
    // ...
    // ... (rest of imports and interfaces remain same until line 12)
    id: string;
    name: string;
    description: string;
    created_by: string;
    created_at: string;
    invite_code: string;
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

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const groupIdString = resolvedParams.id;

    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (groupIdString) {
            fetchData();
        }
    }, [groupIdString]);

    const fetchData = async () => {
        const { getGroupPageData } = await import("@/app/groups/actions");
        const res = await getGroupPageData(groupIdString);

        if (res.error) {
            if (res.error === "Not authenticated") {
                router.push("/login");
            } else if (res.error === "Group not found") {
                setLoading(false);
            }
            return;
        }

        if (res.group) setGroup(res.group as any);
        if (res.members) setMembers(res.members as any);
        if (res.userRole) setUserRole(res.userRole);
        if (res.user) setUser({ id: res.user.id });

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
            <div className="max-w-6xl mx-auto px-4">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info & Members */}
                    <div className="lg:col-span-1 space-y-6">
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
                                            <p className="text-[10px] text-gray-500">
                                                Joined {new Date(member.joined_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-semibold rounded ${member.role === "admin"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {member.role.toUpperCase()}
                                            </span>

                                            {userRole === "admin" && member.user_id !== user?.id && (
                                                <button
                                                    onClick={() => removeMember(member.id)}
                                                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Group Actions / Settings (Small Card) */}
                        <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                            <h4 className="font-bold text-gray-700 mb-2">Invite Code</h4>
                            <div className="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-100">
                                <code className="text-blue-800 font-mono font-bold tracking-wider">{group.invite_code}</code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(group.invite_code);
                                        alert("Invite code copied!");
                                    }}
                                    className="text-blue-600 text-xs hover:underline"
                                >
                                    Copy
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2">Share this code with classmates to join.</p>
                        </div>
                    </div>

                    {/* Right Column: Virtual Study Room (Messenger) */}
                    <div className="lg:col-span-2">
                        {user && (
                            <GroupChat
                                groupId={groupIdString}
                                currentUserId={user.id}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
