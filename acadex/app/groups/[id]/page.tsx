"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import GroupChat from "@/components/GroupChat";
import { ArrowLeft, Users, Shield, Copy, UserMinus, Key } from "lucide-react";

interface Group {
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

function GroupDetailSkeleton() {
    return (
        <div className="w-full space-y-6 animate-pulse">
            <div className="flex justify-between items-center mb-8 border-b border-muted/20 pb-4">
                <div className="space-y-2">
                    <div className="h-10 w-64 bg-muted/20 rounded-xl"></div>
                    <div className="h-4 w-40 bg-muted/20 rounded-md"></div>
                </div>
                <div className="h-10 w-24 bg-muted/20 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="h-64 bg-white rounded-2xl border border-muted/10 p-6"></div>
                    <div className="h-32 bg-white rounded-2xl border border-muted/10 p-6"></div>
                </div>
                <div className="lg:col-span-2">
                    <div className="h-[500px] bg-white rounded-2xl border border-muted/10 p-6"></div>
                </div>
            </div>
        </div>
    );
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
        return (
            <div className="w-full pb-10">
                <GroupDetailSkeleton />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-2xl border border-muted/20 mt-10">
                <Users className="w-12 h-12 text-primary/40 mb-4" />
                <h3 className="text-2xl font-semibold text-primary mb-2">Group not found</h3>
                <p className="text-primary/60 mb-8 max-w-sm">The group you're looking for doesn't exist or you don't have access to it.</p>
                <Link
                    href="/groups"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Groups
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full pb-10">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 border-b border-muted/20 pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">{group.name}</h1>
                    {group.description && (
                        <p className="text-primary/60 mt-2 text-sm max-w-2xl">{group.description}</p>
                    )}
                </div>
                <Link
                    href="/groups"
                    className="self-start flex items-center gap-2 py-2 px-4 bg-muted/10 text-primary font-medium rounded-xl hover:bg-muted/20 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Groups
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Members */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Group Info Widget */}
                    <div className="bg-white p-6 rounded-2xl shadow-subtle border border-muted/20">
                        <div className="flex items-center gap-2 mb-4 text-primary">
                            <Key className="w-5 h-5" />
                            <h4 className="font-bold tracking-tight">Access Credentials</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-accent/20 p-3 rounded-xl border border-accent/30">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-primary/50 tracking-wider mb-1">Invite Code</p>
                                    <code className="text-primary font-mono font-bold text-lg leading-none">{group.invite_code}</code>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(group.invite_code);
                                        alert("Invite code copied!");
                                    }}
                                    className="p-2 text-primary/60 hover:text-primary hover:bg-white rounded-lg transition-all"
                                    title="Copy Invite Code"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-primary/50">Share this code with classmates so they can join this study group.</p>
                        </div>
                    </div>

                    {/* Members Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-subtle border border-muted/20">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
                                <Users className="w-5 h-5" /> Members
                            </h2>
                            <span className="text-xs font-bold bg-muted/10 text-primary px-2.5 py-1 rounded-full">{members.length}</span>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex justify-between items-center p-3.5 bg-background/50 border border-muted/10 rounded-xl hover:border-muted/30 transition-colors group"
                                >
                                    <div className="min-w-0 pr-4">
                                        <p className="font-semibold text-primary truncate">
                                            {member.profiles?.username || "Unknown User"}
                                        </p>
                                        <p className="text-[10px] text-primary/40 mt-0.5">
                                            Joined {new Date(member.joined_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span
                                            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md ${member.role === "admin"
                                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                    : "bg-muted/10 text-primary/70 border border-muted/20"
                                                }`}
                                        >
                                            {member.role === "admin" && <Shield className="w-3 h-3" />}
                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                        </span>

                                        {userRole === "admin" && member.user_id !== user?.id && (
                                            <button
                                                onClick={() => removeMember(member.id)}
                                                className="p-1.5 min-w-[28px] text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Remove Member"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Virtual Study Room (Messenger) */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-subtle border border-muted/20 h-[600px] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-muted/20 bg-muted/5">
                            <h3 className="font-bold text-primary">virtual study room</h3>
                            <p className="text-xs text-primary/50">Discuss notes and topics with {group.name}</p>
                        </div>
                        <div className="flex-1 bg-background relative">
                            {user ? (
                                <GroupChat
                                    groupId={groupIdString}
                                    currentUserId={user.id}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-primary/40 text-sm">Loading Chat...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
