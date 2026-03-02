"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { getNotes } from "./actions";
import {
    FileText, Search, Clock, User, BookOpen,
    PenLine, Upload, Globe, Lock, Users, X
} from "lucide-react";

type OwnerFilter = "all" | "mine" | "others";
type VisibilityFilter = "public" | "private" | "group" | null;

const OWNER_TABS: { id: OwnerFilter; label: string }[] = [
    { id: "all", label: "All Notes" },
    { id: "mine", label: "My Notes" },
    { id: "others", label: "Others" },
];

const VISIBILITY_PILLS: { id: "public" | "private" | "group"; label: string; icon: React.ElementType; active: string; inactive: string }[] = [
    {
        id: "public",
        label: "Public",
        icon: Globe,
        active: "bg-emerald-600 text-white border-emerald-600",
        inactive: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
    },
    {
        id: "private",
        label: "Private",
        icon: Lock,
        active: "bg-amber-500 text-white border-amber-500",
        inactive: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100",
    },
    {
        id: "group",
        label: "Group",
        icon: Users,
        active: "bg-violet-600 text-white border-violet-600",
        inactive: "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100",
    },
];

const VISIBILITY_META: Record<string, { icon: React.ElementType; label: string; cls: string }> = {
    public: { icon: Globe, label: "Public", cls: "text-emerald-600 bg-emerald-50" },
    private: { icon: Lock, label: "Private", cls: "text-amber-600 bg-amber-50" },
    group: { icon: Users, label: "Group", cls: "text-violet-600 bg-violet-50" },
};

export default function NotesPage() {
    const supabase = createClient();
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all");
    const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    useEffect(() => {
        async function init() {
            setLoading(true);
            const [{ data: { user } }, res] = await Promise.all([
                supabase.auth.getUser(),
                getNotes(),
            ]);
            setCurrentUserId(user?.id ?? null);
            if (res.notes) setNotes(res.notes);
            setLoading(false);
        }
        init();
    }, []);

    const filteredNotes = notes.filter((note) => {
        // Search
        const q = searchQuery.toLowerCase();
        if (q && !(
            note.title?.toLowerCase().includes(q) ||
            note.course?.toLowerCase().includes(q) ||
            note.topic?.toLowerCase().includes(q)
        )) return false;

        // Ownership
        if (ownerFilter === "mine" && note.author_id !== currentUserId) return false;
        if (ownerFilter === "others" && note.author_id === currentUserId) return false;

        // Visibility
        if (visibilityFilter && note.visibility !== visibilityFilter) return false;

        // Group Filter
        if (visibilityFilter === "group" && selectedGroupId && note.group_id !== selectedGroupId) return false;

        return true;
    });

    const groups = Array.from(
        new Map(
            notes
                .filter((note) => note.visibility === "group" && note.groups)
                .map((note) => [note.groups.id, note.groups.name])
        )
    ).map(([id, name]) => ({ id, name }));

    const activeFilterCount = (ownerFilter !== "all" ? 1 : 0) + (visibilityFilter ? 1 : 0) + (searchQuery ? 1 : 0) + (selectedGroupId ? 1 : 0);

    function clearFilters() {
        setOwnerFilter("all");
        setVisibilityFilter(null);
        setSelectedGroupId(null);
        setSearchQuery("");
    }

    return (
        <main className="w-full pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-muted/20 pb-6 mb-6 mt-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary/70 shadow-sm">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-primary tracking-tight">Study Notes</h1>
                        <p className="text-primary/60 text-sm mt-1">
                            Browse, search, and discover notes across courses.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                    {/* Search */}
                    <div className="relative w-full md:w-60">
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-muted/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-primary placeholder:text-muted transition-all shadow-sm"
                        />
                        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <Link
                        href="/notes/upload"
                        className="border border-muted/40 text-primary font-medium py-2.5 px-4 rounded-xl hover:bg-primary/5 transition-all flex items-center gap-2 text-sm shadow-sm whitespace-nowrap shrink-0"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                    </Link>

                    <Link
                        href="/notes/create"
                        className="bg-primary text-white font-medium py-2.5 px-4 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 text-sm shadow-sm whitespace-nowrap shrink-0"
                    >
                        <PenLine className="w-4 h-4" />
                        <span>New Note</span>
                    </Link>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Ownership Tabs */}
                <div className="flex items-center bg-background border border-muted/30 rounded-xl p-1 gap-0.5 shadow-sm">
                    {OWNER_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setOwnerFilter(tab.id)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${ownerFilter === tab.id
                                ? "bg-primary text-white shadow-sm"
                                : "text-primary/60 hover:text-primary hover:bg-primary/5"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-7 bg-muted/30" />

                {/* Visibility Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-primary/40 uppercase tracking-widest mr-1 hidden sm:block">Show</span>
                    {VISIBILITY_PILLS.map(({ id, label, icon: Icon, active, inactive }) => {
                        const isActive = visibilityFilter === id;
                        return (
                            <button
                                key={id}
                                onClick={() => {
                                    const next = isActive ? null : id;
                                    setVisibilityFilter(next);
                                    if (next !== "group") setSelectedGroupId(null);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${isActive ? active : inactive}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Group Selector (Animated) */}
                {visibilityFilter === "group" && groups.length > 0 && (
                    <div className="flex items-center gap-2 bg-violet-50/50 p-1 rounded-xl border border-violet-100 animate-in fade-in slide-in-from-left-2 duration-300">
                        <select
                            value={selectedGroupId || ""}
                            onChange={(e) => setSelectedGroupId(e.target.value || null)}
                            className="bg-transparent text-xs font-bold text-violet-700 outline-none px-2 cursor-pointer"
                        >
                            <option value="">All Groups</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-primary/50 hover:text-primary transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                        Clear {activeFilterCount > 1 ? `${activeFilterCount} filters` : "filter"}
                    </button>
                )}
            </div>

            {/* Results count */}
            {!loading && (
                <p className="text-xs text-primary/40 font-medium mb-4">
                    {filteredNotes.length === 0
                        ? "No notes match your filters"
                        : `${filteredNotes.length} note${filteredNotes.length !== 1 ? "s" : ""} found`}
                </p>
            )}

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-card rounded-2xl p-6 border border-muted/20 shadow-subtle animate-pulse space-y-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="h-6 w-3/4 bg-muted/20 rounded-lg" />
                                <div className="w-8 h-8 rounded-full bg-muted/10" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-1/3 bg-muted/10 rounded-md" />
                                <div className="h-4 w-1/2 bg-muted/10 rounded-md" />
                            </div>
                            <div className="pt-4 mt-4 border-t border-muted/10 flex justify-between">
                                <div className="h-4 w-1/4 bg-muted/10 rounded-md" />
                                <div className="h-4 w-1/4 bg-muted/10 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className="bg-card rounded-2xl border border-muted/20 shadow-subtle flex flex-col items-center justify-center p-16 text-center max-w-2xl mx-auto mt-8">
                    <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center mb-5">
                        <FileText className="w-8 h-8 text-primary/30" />
                    </div>
                    <h2 className="text-xl font-bold text-primary tracking-tight mb-2">
                        {activeFilterCount > 0 ? "No Matches" : "No Notes Available"}
                    </h2>
                    <p className="text-primary/60 mb-7 max-w-sm">
                        {activeFilterCount > 0
                            ? "Try adjusting your filters or search query."
                            : "Your repository is empty. Start by creating or uploading a note."}
                    </p>
                    {activeFilterCount > 0 ? (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-6 py-2.5 border border-muted/40 text-primary font-semibold rounded-xl hover:bg-primary/5 transition-all text-sm"
                        >
                            <X className="w-4 h-4" /> Clear Filters
                        </button>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/notes/create" className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
                                <PenLine className="w-4 h-4" /> Create a Note
                            </Link>
                            <Link href="/notes/upload" className="border border-muted/40 text-primary font-semibold py-3 px-8 rounded-xl hover:bg-primary/5 transition-all flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Upload a File
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map((note) => {
                        const vis = VISIBILITY_META[note.visibility] ?? VISIBILITY_META["public"];
                        const VisIcon = vis.icon;
                        const isOwn = note.author_id === currentUserId;
                        return (
                            <Link
                                href={`/notes/${note.id}`}
                                key={note.id}
                                className="group bg-card rounded-2xl p-6 border border-muted/20 shadow-subtle hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-4 gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-primary leading-tight group-hover:text-primary/80 transition-colors line-clamp-2">
                                            {note.title || "Untitled Note"}
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                                            {note.course && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/5 text-primary/70 font-semibold text-xs rounded-md">
                                                    <BookOpen className="w-3 h-3" />
                                                    {note.course}
                                                </span>
                                            )}
                                            {/* Visibility badge */}
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md ${vis.cls}`}>
                                                <VisIcon className="w-3 h-3" />
                                                {vis.label}
                                            </span>
                                            {/* Mine badge */}
                                            {isOwn && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md">
                                                    ✦ Mine
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/40 shrink-0 group-hover:bg-primary/10 transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                </div>

                                {note.topic && (
                                    <p className="text-primary/70 text-sm line-clamp-2 mb-4 flex-1">
                                        <span className="font-semibold text-primary/40 text-xs uppercase tracking-wider block mb-0.5">Topic</span>
                                        {note.topic}
                                    </p>
                                )}
                                {!note.topic && <div className="flex-1" />}

                                <div className="pt-4 mt-auto border-t border-muted/10 flex items-center justify-between text-xs text-primary/50 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 opacity-70" />
                                        <span className="truncate max-w-[100px]">{note.profiles?.username || "Unknown"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 opacity-70" />
                                        <span>{new Date(note.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
