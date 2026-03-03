"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { getProfile } from "../settings/actions";
import VoteButtons from "@/components/VoteButtons";
import { getGroupById } from "../groups/actions";
import {
  FileText, Plus, Upload, BookOpen, Clock, Users, Database,
  HelpCircle, Settings, Bell, Search, Filter, Trash2, Shield, Trophy
} from "lucide-react";
import BrandLoader from "@/components/BrandLoader";

interface Note {
  id: number;
  title: string;
  content: string;
  course: string;
  topic: string;
  created_at: string;
  author_id: string;
  type: string | null;
  visibility: string;
  group_id: string | null;
  comment_count?: number;
}

type FilterType = "all" | "notes" | "pdfs" | "top";

function DashboardSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="flex justify-between items-center mb-8 border-b border-muted/20 pb-4">
        <div className="h-10 w-48 bg-muted/20 rounded-xl"></div>
        <div className="h-10 w-10 bg-muted/20 rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card p-6 rounded-2xl shadow-sm border border-muted/10 h-40">
            <div className="h-4 w-24 bg-muted/20 rounded mb-4"></div>
            <div className="h-10 w-16 bg-muted/20 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-muted/20 rounded"></div>
              <div className="h-4 w-1/2 bg-muted/20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-8 w-64 bg-muted/20 rounded mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-card rounded-2xl border border-muted/10 p-5"></div>
        ))}
      </div>
    </div>
  );
}

function DashboardContent() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [userJoinedGroups, setUserJoinedGroups] = useState<{ id: string; name: string }[]>([]);
  const [groupDetail, setGroupDetail] = useState<{ name: string; invite_code: string; } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const groupFilter = searchParams.get("group");
  const supabase = createClient();


  const [voteData, setVoteData] = useState<Record<number, { up: number; down: number; userVote: 1 | -1 | null }>>({});

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const profile = await getProfile(user.id);
      setUser({ id: user.id, username: profile?.username || "User" });

      const { data: memberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      const groupIds = memberships?.map((m: { group_id: string }) => m.group_id) || [];

      const { data: groupNames } = await supabase
        .from("groups")
        .select("id, name")
        .in("id", groupIds);
      setUserJoinedGroups(groupNames || []);

      if (groupFilter) {
        const detail = await getGroupById(groupFilter);
        setGroupDetail(detail);
      } else {
        setGroupDetail(null);
      }

      const { data: allNotes, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && allNotes) {
        const filtered = allNotes.filter((note: Note) => {
          let hasAccess = false;
          if (note.visibility === "public") hasAccess = true;
          else if (note.visibility === "private") hasAccess = note.author_id === user.id;
          else if (note.visibility === "group") {
            hasAccess = (note.group_id != null && groupIds.includes(note.group_id)) || note.author_id === user.id;
          }

          if (!hasAccess) return false;
          if (groupFilter && note.group_id !== groupFilter) return false;

          return true;
        });
        setNotes(filtered as Note[]);

        const noteIds = (filtered as Note[]).map((n) => n.id);
        if (noteIds.length > 0) {
          const { data: votes } = await supabase
            .from("note_votes")
            .select("*")
            .in("note_id", noteIds);

          if (votes) {
            const vData: Record<number, { up: number; down: number; userVote: 1 | -1 | null }> = {};
            noteIds.forEach((id) => { vData[id] = { up: 0, down: 0, userVote: null }; });
            votes.forEach((v: { note_id: number; vote_type: number; user_id: string }) => {
              if (!vData[v.note_id]) return;
              if (v.vote_type === 1) vData[v.note_id].up++;
              else if (v.vote_type === -1) vData[v.note_id].down++;
              if (v.user_id === user.id) vData[v.note_id].userVote = v.vote_type as 1 | -1;
            });
            setVoteData(vData);
          }
        }

        if (noteIds.length > 0) {
          const { data: commentCounts, error: commentError } = await supabase
            .from("note_comments")
            .select("note_id")
            .in("note_id", noteIds);

          if (!commentError && commentCounts) {
            const cData: Record<number, number> = {};
            noteIds.forEach((id) => { cData[id] = 0; });
            commentCounts.forEach((c: { note_id: number }) => {
              if (cData[c.note_id] !== undefined) cData[c.note_id]++;
            });

            setNotes((prev) =>
              prev.map((n) => ({ ...n, comment_count: cData[n.id] || 0 }))
            );
          }
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [router, supabase, groupFilter]);

  const deleteNote = async (id: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      alert("Error deleting note");
      console.error(error);
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const pdfCount = notes.filter((n) => n.type === "pdf").length;
  const noteCount = notes.length - pdfCount;

  const filteredNotes = notes.filter((note) => {
    const isPdf = note.type === "pdf";
    if (filter === "pdfs" && !isPdf) return false;
    if (filter === "notes" && isPdf) return false;

    if (visibilityFilter !== "all" && note.visibility !== visibilityFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const haystack = `${note.title} ${note.course} ${note.topic}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  // Apply sorting for Top Rated
  if (filter === "top") {
    filteredNotes.sort((a, b) => {
      const scoreA = (voteData[a.id]?.up || 0) - (voteData[a.id]?.down || 0);
      const scoreB = (voteData[b.id]?.up || 0) - (voteData[b.id]?.down || 0);
      return scoreB - scoreA;
    });
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="w-full pb-10">
      <BrandLoader />
      <div className="flex justify-between items-center mb-8 border-b border-muted/20 pb-4">
        <h1 className="text-3xl font-bold text-primary tracking-tight">
          Welcome back, {user.username}
        </h1>
        <Link
          href="/settings"
          className="p-2 text-primary/70 hover:bg-muted/10 hover:text-primary rounded-xl transition-all"
        >
          <Settings className="w-6 h-6" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-card p-6 rounded-2xl shadow-subtle border border-muted/20 flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary/60">
              <FileText className="w-5 h-5" />
              <p className="text-sm font-medium">Total Notes</p>
            </div>
            <p className="text-5xl font-extrabold text-primary tracking-tighter">
              {notes.length}
            </p>
          </div>
          <div className="flex gap-4 mt-6">
            <Link
              href="/notes/create"
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/70 bg-muted/10 hover:bg-muted/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Create
            </Link>
            <Link
              href="/notes/upload"
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/70 bg-muted/10 hover:bg-muted/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload
            </Link>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-subtle border border-muted/20 flex flex-col">
          <p className="text-sm font-medium text-primary/60 mb-4 pb-2 border-b border-muted/10">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3 flex-1 text-sm font-medium">
            <Link href="/schedule" className="flex items-center gap-2 text-primary hover:text-primary/70 p-2 rounded-xl hover:bg-muted/10 transition-all">
              <Clock className="w-4 h-4" /> Schedule
            </Link>
            <Link href="/groups" className="flex items-center gap-2 text-primary hover:text-primary/70 p-2 rounded-xl hover:bg-muted/10 transition-all">
              <Users className="w-4 h-4" /> Groups
            </Link>
            <Link href="/resources" className="flex items-center gap-2 text-primary hover:text-primary/70 p-2 rounded-xl hover:bg-muted/10 transition-all">
              <Database className="w-4 h-4" /> Resources
            </Link>
            <Link href="/reminder" className="flex items-center gap-2 text-primary hover:text-primary/70 p-2 rounded-xl hover:bg-muted/10 transition-all">
              <Bell className="w-4 h-4" /> Reminders
            </Link>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-subtle border border-muted/20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 text-primary text-2xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <p className="font-bold text-lg text-primary">{user.username}</p>
          <p className="font-mono text-xs mt-1 text-primary/40 px-4 py-1 bg-muted/10 rounded-full max-w-full truncate">
            {user.id}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">
            {groupDetail ? `${groupDetail.name} Notes` : "Recent Notes"}
          </h2>
          {groupDetail && (
            <p className="text-sm text-primary/60 mt-1 flex items-center gap-2">
              Invite Code:
              <span className="font-mono text-xs font-bold leading-none bg-accent text-primary px-2 py-1 rounded-md">
                {groupDetail.invite_code}
              </span>
            </p>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, course, topic…"
            className="w-full md:w-64 pl-9 pr-4 py-2 text-sm bg-card border border-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex bg-card border border-muted/20 p-1 rounded-xl shadow-sm">
          {(["all", "notes", "pdfs", "top"] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all flex items-center gap-2 ${filter === t
                ? "bg-muted/20 text-primary"
                : "text-primary/60 hover:text-primary hover:bg-muted/5"
                }`}
            >
              {t === "top" && <Trophy className="w-4 h-4" />}
              {t} {t === 'all' ? `(${notes.length})` : t === 'notes' ? `(${noteCount})` : t === 'pdfs' ? `(${pdfCount})` : ''}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-card border border-muted/20 px-3 py-1.5 rounded-xl shadow-sm">
          <Filter className="w-4 h-4 text-primary/40" />
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="text-sm border-none bg-transparent text-primary focus:ring-0 outline-none pr-8 cursor-pointer font-medium"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="group">Group Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        {userJoinedGroups.length > 0 && (
          <div className="flex items-center gap-2 bg-card border border-muted/20 px-3 py-1.5 rounded-xl shadow-sm">
            <Users className="w-4 h-4 text-primary/40" />
            <select
              value={groupFilter || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val) router.push(`/dashboard?group=${val}`);
                else router.push("/dashboard");
              }}
              className="text-sm border-none bg-transparent text-primary focus:ring-0 outline-none pr-8 cursor-pointer font-medium"
            >
              <option value="">All Groups</option>
              {userJoinedGroups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}

        {(visibilityFilter !== "all" || groupFilter || filter !== "all") && (
          <button
            onClick={() => {
              setVisibilityFilter("all");
              setFilter("all");
              router.push("/dashboard");
            }}
            className="text-sm font-medium text-primary/50 hover:text-primary transition-colors ml-auto md:ml-0"
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const isPdf = note.type === "pdf";
            const isOwner = user.id === note.author_id;

            return (
              <div
                key={note.id}
                className="group relative bg-card rounded-2xl shadow-subtle border border-muted/20 overflow-hidden flex flex-col hover:border-muted/40 transition-all duration-300 hover:-translate-y-1"
              >
                <Link href={`/notes/${note.id}`} className="block p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-primary tracking-tight leading-tight line-clamp-2 pr-6">
                      {note.title}
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm text-primary/70 mb-6">
                    {note.course && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 opacity-50" />
                        <span className="truncate">{note.course}</span>
                      </div>
                    )}
                    {note.topic && (
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 opacity-50" />
                        <span className="truncate">{note.topic}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-auto">
                    {isPdf && (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-md border border-red-100">
                        PDF
                      </span>
                    )}

                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-md border ${note.visibility === "private"
                        ? "bg-slate-50 border-slate-200 text-slate-600"
                        : note.visibility === "group"
                          ? "bg-purple-50 border-purple-200 text-purple-600"
                          : "bg-green-50 border-green-200 text-green-600"
                        }`}
                    >
                      {note.visibility.charAt(0).toUpperCase() + note.visibility.slice(1)}
                    </span>

                    {isOwner && (
                      <span className="px-2.5 py-1 text-xs font-medium bg-accent/30 text-primary border border-accent/50 rounded-md flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Owner
                      </span>
                    )}

                  </div>
                </Link>

                <div className="px-6 py-4 bg-muted/5 border-t border-muted/10 flex justify-between items-center">
                  <div className="flex items-center gap-4 text-xs font-medium text-primary/50">
                    <span>{new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1">
                      💬 {note.comment_count || 0}
                    </span>
                  </div>
                  <div className="scale-90 origin-right">
                    <VoteButtons
                      noteId={note.id}
                      initialUpvotes={voteData[note.id]?.up || 0}
                      initialDownvotes={voteData[note.id]?.down || 0}
                      initialUserVote={voteData[note.id]?.userVote || null}
                    />
                  </div>
                </div>

                {isOwner && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      deleteNote(note.id);
                    }}
                    className="absolute top-4 right-4 p-2 text-primary/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-card rounded-2xl border border-muted/20 border-dashed">
          <div className="w-16 h-16 bg-muted/10 rounded-2xl flex items-center justify-center mb-4 text-primary/40">
            <BookOpen className="w-8 h-8" />
          </div>

          {groupFilter ? (
            <>
              <h3 className="text-xl font-bold text-primary mb-2">No notes in this group</h3>
              <p className="text-primary/60 max-w-sm mb-8">
                {groupDetail
                  ? `${groupDetail.name} doesn't have any shared notes yet. Start the collaboration!`
                  : "This group doesn't have any shared notes yet."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/notes/create?group=${groupFilter}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-background font-bold rounded-xl shadow-sm transition-all"
                >
                  <Plus className="w-5 h-5" /> Write a Note
                </Link>
                <Link
                  href="/notes/upload"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-card border border-muted/30 hover:bg-muted/10 text-primary font-bold rounded-xl transition-all"
                >
                  <Upload className="w-5 h-5" /> Import PDF
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-primary mb-2">No notes found</h3>
              <p className="text-primary/60 max-w-sm mb-6">
                We couldn&apos;t find any notes matching your current filters and search.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                    setVisibilityFilter("all");
                    router.push("/dashboard");
                  }}
                  className="px-4 py-2 font-medium text-sm text-primary hover:bg-muted/10 rounded-xl transition-all"
                >
                  Clear filters
                </button>
                <Link
                  href="/notes/create"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-background font-medium text-sm rounded-xl shadow-sm transition-all"
                >
                  Create a Note
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}


