"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import GroupChat from "@/components/GroupChat";
import {
    ArrowLeft, Users, Shield, Copy, UserMinus, Key,
    MessageSquare, BookOpen, PenLine, Upload, FileText, Clock
} from "lucide-react";
import { getGroupPageData } from "@/app/groups/actions";

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
    profiles: { username: string };
}

interface Note {
    id: number;
    title: string;
    course: string;
    topic: string;
    created_at: string;
    type: string | null;
    visibility: string;
    profiles?: { username: string };
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
                    <div className="h-64 bg-card rounded-2xl border border-muted/10 p-6"></div>
                    <div className="h-32 bg-card rounded-2xl border border-muted/10 p-6"></div>
                </div>
                <div className="lg:col-span-2">
                    <div className="h-[500px] bg-card rounded-2xl border border-muted/10 p-6"></div>
                </div>
            </div>
        </div>
    );
}

function GroupDetail({ groupId }: { groupId: string }) {
    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [notesLoading, setNotesLoading] = useState(false);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"chat" | "notes">("chat");

    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    // Read initial tab from URL
    useEffect(() => {
        if (searchParams.get("tab") === "notes") {
            setActiveTab("notes");
        }
    }, [searchParams]);

    const fetchData = async () => {
        const res = await getGroupPageData(groupId);

        if (res.error) {
            if (res.error === "Not authenticated") router.push("/login");
            setLoading(false);
            return;
        }

        if (res.group) setGroup(res.group as any);
        if (res.members) setMembers(res.members as any);
        if (res.userRole) setUserRole(res.userRole);
        if (res.user) setUser({ id: res.user.id });

        setLoading(false);
    };

    const fetchGroupNotes = async () => {
        setNotesLoading(true);
        const { data } = await supabase
            .from("notes")
            .select("id, title, course, topic, created_at, type, visibility, profiles(username)")
            .eq("group_id", groupId)
            .eq("visibility", "group")
            .order("created_at", { ascending: false });

        setNotes((data as unknown as Note[]) || []);
        setNotesLoading(false);
    };

    useEffect(() => {
        if (groupId) fetchData();
    }, [groupId]);

    useEffect(() => {
        if (activeTab === "notes" && groupId) fetchGroupNotes();
    }, [activeTab, groupId]);

    const removeMember = async (memberId: number) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        const { error } = await supabase.from("group_members").delete().eq("id", memberId);
        if (error) alert("Error removing member: " + error.message);
        else fetchData();
    };

    if (loading) return <div className="w-full pb-10"><GroupDetailSkeleton /></div>;

    if (!group) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-card rounded-2xl border border-muted/20 mt-10">
                <Users className="w-12 h-12 text-primary/40 mb-4" />
                <h3 className="text-2xl font-semibold text-primary mb-2">Group not found</h3>
                <p className="text-primary/60 mb-8 max-w-sm">The group you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
                <Link href="/groups" className="flex items-center gap-2 px-6 py-3 bg-primary text-background font-medium rounded-xl hover:bg-primary/90 transition-all">
                    <ArrowLeft className="w-5 h-5" /> Back to Groups
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full pb-10">
            {/* Header */}
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
                {/* LEFT COLUMN */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Access Credentials */}
                    <div className="bg-card p-6 rounded-2xl shadow-subtle border border-muted/20">
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
                                    onClick={() => { navigator.clipboard.writeText(group.invite_code); alert("Invite code copied!"); }}
                                    className="p-2 text-primary/60 hover:text-primary hover:bg-card rounded-lg transition-all"
                                    title="Copy Invite Code"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-primary/50">Share this code with classmates so they can join this study group.</p>
                        </div>
                    </div>

                    {/* Members */}
                    <div className="bg-card p-6 rounded-2xl shadow-subtle border border-muted/20">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
                                <Users className="w-5 h-5" /> Members
                            </h2>
                            <span className="text-xs font-bold bg-muted/10 text-primary px-2.5 py-1 rounded-full">{members.length}</span>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex justify-between items-center p-3.5 bg-background/50 border border-muted/10 rounded-xl hover:border-muted/30 transition-colors group"
                                >
                                    <div className="min-w-0 pr-4">
                                        <p className="font-semibold text-primary truncate">
                                            {Array.isArray(member.profiles)
                                                ? (member.profiles[0]?.username || "Unknown User")
                                                : (member.profiles?.username || "Unknown User")}
                                        </p>
                                        <p className="text-[10px] text-primary/40 mt-0.5">
                                            Joined {new Date(member.joined_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md ${member.role === "admin"
                                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                                            : "bg-muted/10 text-primary/70 border border-muted/20"
                                            }`}>
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

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-2">
                    {/* Tab Switcher */}
                    <div className="flex gap-1 p-1 bg-muted/10 rounded-xl border border-muted/10 mb-4 w-fit">
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "chat"
                                ? "bg-card text-primary shadow-sm"
                                : "text-primary/50 hover:text-primary hover:bg-card/50"
                                }`}
                        >
                            <MessageSquare className="w-4 h-4" /> Chat Room
                        </button>
                        <button
                            onClick={() => setActiveTab("notes")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "notes"
                                ? "bg-card text-primary shadow-sm"
                                : "text-primary/50 hover:text-primary hover:bg-card/50"
                                }`}
                        >
                            <BookOpen className="w-4 h-4" /> Group Notes
                        </button>
                    </div>

                    {/* Chat Tab */}
                    {activeTab === "chat" && (
                        <div className="bg-card rounded-2xl shadow-subtle border border-muted/20 h-[600px] overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-muted/20 bg-muted/5">
                                <h3 className="font-bold text-primary">Virtual Study Room</h3>
                                <p className="text-xs text-primary/50">Discuss notes and topics with {group.name}</p>
                            </div>
                            <div className="flex-1 bg-background relative min-h-0">
                                {user ? (
                                    <GroupChat groupId={groupId} currentUserId={user.id} />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-primary/40 text-sm">Loading Chat...</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes Tab */}
                    {activeTab === "notes" && (
                        <div className="bg-card rounded-2xl shadow-subtle border border-muted/20 min-h-[600px] flex flex-col overflow-hidden">
                            <div className="p-5 border-b border-muted/20 bg-muted/5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-primary">Group Notes</h3>
                                    <p className="text-xs text-primary/50 mt-0.5">Notes shared with {group.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/notes/create?group=${groupId}`}
                                        className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-background px-3 py-2 rounded-lg hover:bg-primary/90 transition-all"
                                    >
                                        <PenLine className="w-3.5 h-3.5" /> Write Note
                                    </Link>
                                    <Link
                                        href="/notes/upload"
                                        className="flex items-center gap-1.5 text-xs font-semibold bg-muted/10 text-primary border border-muted/20 px-3 py-2 rounded-lg hover:bg-muted/20 transition-all"
                                    >
                                        <Upload className="w-3.5 h-3.5" /> Import PDF
                                    </Link>
                                </div>
                            </div>

                            <div className="flex-1 p-5">
                                {notesLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 bg-muted/10 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : notes.length === 0 ? (
                                    /* Empty State */
                                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
                                        <div className="w-16 h-16 bg-muted/10 rounded-2xl flex items-center justify-center mb-4 text-primary/30">
                                            <BookOpen className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-bold text-primary mb-2">No group notes yet</h3>
                                        <p className="text-primary/50 text-sm max-w-sm mb-8">
                                            Be the first to share a note with <span className="font-semibold text-primary/70">{group.name}</span>. Write something new or upload an existing PDF.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Link
                                                href={`/notes/create?group=${groupId}`}
                                                className="flex items-center justify-center gap-2 bg-primary text-background font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                                            >
                                                <PenLine className="w-4 h-4" /> Write a Note
                                            </Link>
                                            <Link
                                                href="/notes/upload"
                                                className="flex items-center justify-center gap-2 border border-muted/40 text-primary font-semibold px-6 py-3 rounded-xl hover:bg-muted/10 transition-all"
                                            >
                                                <Upload className="w-4 h-4" /> Upload PDF
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    /* Notes Grid */
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {notes.map((note) => {
                                            const isPdf = note.type === "pdf";
                                            return (
                                                <Link
                                                    key={note.id}
                                                    href={`/notes/${note.id}`}
                                                    className="group flex flex-col p-4 bg-background border border-muted/20 rounded-xl hover:border-primary/20 hover:shadow-sm transition-all"
                                                >
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <h4 className="font-bold text-primary leading-tight line-clamp-2 group-hover:text-primary/80">
                                                            {note.title || "Untitled Note"}
                                                        </h4>
                                                        {isPdf && (
                                                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-md">PDF</span>
                                                        )}
                                                    </div>
                                                    {note.course && (
                                                        <p className="text-xs text-primary/60 flex items-center gap-1.5 mb-1">
                                                            <BookOpen className="w-3 h-3" /> {note.course}
                                                        </p>
                                                    )}
                                                    {note.topic && (
                                                        <p className="text-xs text-primary/50 line-clamp-1 mb-3">{note.topic}</p>
                                                    )}
                                                    <div className="mt-auto flex items-center justify-between text-[10px] text-primary/40 font-medium pt-2 border-t border-muted/10">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(note.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="w-3 h-3" />
                                                            {(note.profiles as any)?.username || "Unknown"}
                                                        </span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return (
        <Suspense fallback={<div className="w-full pb-10"><GroupDetailSkeleton /></div>}>
            <GroupDetail groupId={resolvedParams.id} />
        </Suspense>
    );
}
