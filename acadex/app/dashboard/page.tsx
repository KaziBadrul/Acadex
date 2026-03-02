"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { getProfile } from "../settings/actions";
import VoteButtons from "@/components/VoteButtons";
import { getGroupById } from "../groups/actions";

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

type FilterType = "all" | "notes" | "pdfs";

function DashboardContent() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null,
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [userJoinedGroups, setUserJoinedGroups] = useState<
    { id: string; name: string }[]
  >([]);
  const [groupDetail, setGroupDetail] = useState<{
    name: string;
    invite_code: string;
  } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const groupFilter = searchParams.get("group");
  const supabase = createClient();

  const [myGroupIds, setMyGroupIds] = useState<string[]>([]);

  /* Vote State */
  const [voteData, setVoteData] = useState<
    Record<number, { up: number; down: number; userVote: 1 | -1 | null }>
  >({});

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Use server action to bypass RLS for reading profile
      const profile = await getProfile(user.id);

      setUser({ id: user.id, username: profile?.username || "User" });

      // 1. Fetch user's groups to filter group notes
      const { data: memberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      const groupIds = memberships?.map((m: any) => m.group_id) || [];
      setMyGroupIds(groupIds);

      // Fetch join group names for the selector
      const { data: groupNames } = await supabase
        .from("groups")
        .select("id, name")
        .in("id", groupIds);
      setUserJoinedGroups(groupNames || []);

      // 1.5 Fetch group detail if filtering
      if (groupFilter) {
        const detail = await getGroupById(groupFilter);
        setGroupDetail(detail);
      } else {
        setGroupDetail(null);
      }

      // 2. Fetch all notes (we will filter in JS for now or redo query if too many)
      // Since user wants to bypass RLS, we get all and filter by logic.
      const { data: allNotes, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && allNotes) {
        const filtered = allNotes.filter((note: any) => {
          // Basic visibility rules
          let hasAccess = false;
          if (note.visibility === "public") hasAccess = true;
          else if (note.visibility === "private")
            hasAccess = note.author_id === user.id;
          else if (note.visibility === "group") {
            hasAccess =
              groupIds.includes(note.group_id) || note.author_id === user.id;
          }

          if (!hasAccess) return false;

          // Optional group filter from URL
          if (groupFilter && note.group_id !== groupFilter) return false;

          return true;
        });
        setNotes(filtered as Note[]);

        // --- Fetch Votes for filtered notes ---
        const noteIds = filtered.map((n: any) => n.id);
        if (noteIds.length > 0) {
          const { data: votes } = await supabase
            .from("note_votes")
            .select("*")
            .in("note_id", noteIds);

          if (votes) {
            const vData: Record<
              number,
              { up: number; down: number; userVote: 1 | -1 | null }
            > = {};

            noteIds.forEach((id) => {
              vData[id] = { up: 0, down: 0, userVote: null };
            });

            votes.forEach((v) => {
              if (!vData[v.note_id]) return;

              if (v.vote_type === 1) vData[v.note_id].up++;
              else if (v.vote_type === -1) vData[v.note_id].down++;

              if (v.user_id === user.id) {
                vData[v.note_id].userVote = v.vote_type as 1 | -1;
              }
            });

            setVoteData(vData);
          }
        }

        // --- Fetch Comment Counts for filtered notes ---
        if (noteIds.length > 0) {
          const { data: commentCounts, error: commentError } = await supabase
            .from("note_comments")
            .select("note_id")
            .in("note_id", noteIds);

          if (!commentError && commentCounts) {
            const cData: Record<number, number> = {};
            noteIds.forEach((id) => {
              cData[id] = 0;
            });
            commentCounts.forEach((c) => {
              if (cData[c.note_id] !== undefined) cData[c.note_id]++;
            });

            setNotes((prev) =>
              prev.map((n) => ({
                ...n,
                comment_count: cData[n.id] || 0,
              })),
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

  // ---------- FILTER + SEARCH ----------
  const pdfCount = notes.filter((n) => n.type === "pdf").length;
  const noteCount = notes.length - pdfCount;

  const filteredNotes = notes.filter((note) => {
    const isPdf = note.type === "pdf";

    if (filter === "pdfs" && !isPdf) return false;
    if (filter === "notes" && isPdf) return false;

    // Visibility filter (secondary)
    if (visibilityFilter !== "all" && note.visibility !== visibilityFilter)
      return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const haystack =
        `${note.title} ${note.course} ${note.topic}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  if (loading) {
    return <div className="p-12 text-center text-lg">Loading Dashboard...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/acadexLogo.png" alt="Acadex Logo" width="160" />
            </div>

            <div className="hidden md:flex items-center bg-white border rounded-full shadow-sm px-4 py-2 w-[560px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                className="outline-none w-full text-sm text-gray-600"
                placeholder="Search notes, courses, topics..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-sm text-gray-700">Settings</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">{user?.username}</div>
                <div className="text-xs text-gray-400">ID: {user?.id.slice(0, 6)}...</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold shadow-md">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            </div>
          </div>
        </div>

        {/* --- Quick Stats and Actions (styled) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="col-span-1 lg:col-span-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-90">Welcome back,</p>
                <h2 className="text-2xl font-bold mt-1">{user?.username}</h2>
                <p className="mt-3 text-sm opacity-90 max-w-xl">Explore shared notes, upload new study material, or start a fresh note. Your community learning hub is ready.</p>
              </div>
              <div className="hidden md:flex flex-col items-end">
                <p className="text-sm opacity-90">Total Available</p>
                <p className="text-3xl font-extrabold mt-2">{notes.length}</p>
                <div className="mt-4 flex gap-2">
                  <Link href="/notes/create" className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-full text-sm">➕ Create</Link>
                  <Link href="/notes/upload" className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-full text-sm">📥 Upload</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border">
            <p className="text-sm text-gray-500">Quick Actions</p>
            <div className="mt-3 grid gap-2">
              <Link href="/schedule" className="text-sm text-gray-700 hover:text-gray-900">🗓️ View Schedule</Link>
              <Link href="/resources" className="text-sm text-gray-700 hover:text-gray-900">📚 Resource Repository</Link>
              <Link href="/requests" className="text-sm text-gray-700 hover:text-gray-900">📝 Request Note</Link>
              <Link href="/reminder/set" className="text-sm text-gray-700 hover:text-gray-900">⏰ Set Reminder</Link>
              <Link href="/groups" className="text-sm text-gray-700 font-semibold hover:text-gray-900">👥 Manage Groups</Link>
            </div>
          </div>
        </div>

        {/* --- Notes List --- */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
            {groupDetail
              ? `📚 ${groupDetail.name} Notes`
              : "All Available Notes"}
          </h2>
          {groupDetail && (
            <p className="text-sm text-gray-500 mt-2">
              Invite Code:{" "}
              <span className="font-mono font-bold bg-gray-100 px-1 rounded">
                {groupDetail.invite_code}
              </span>
            </p>
          )}
        </div>

        {/* --- Secondary Filters (Visibility & Groups) --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">
              Visibility:
            </span>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {["all", "public", "private", "group"].map((v) => (
                <button
                  key={v}
                  onClick={() => setVisibilityFilter(v)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${visibilityFilter === v
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">
              Select Group:
            </span>
            <select
              value={groupFilter || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val) router.push(`/dashboard?group=${val}`);
                else router.push("/dashboard");
              }}
              className="border rounded-lg px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- All Notes --</option>
              {userJoinedGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {(visibilityFilter !== "all" || groupFilter) && (
            <button
              onClick={() => {
                setVisibilityFilter("all");
                router.push("/dashboard");
              }}
              className="text-xs text-red-500 hover:underline font-bold"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* --- Filters + Search --- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-sm font-semibold rounded border
                ${filter === "all"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              All ({notes.length})
            </button>

            <button
              onClick={() => setFilter("notes")}
              className={`px-3 py-1 text-sm font-semibold rounded border
                ${filter === "notes"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              Notes ({noteCount})
            </button>

            <button
              onClick={() => setFilter("pdfs")}
              className={`px-3 py-1 text-sm font-semibold rounded border
                ${filter === "pdfs"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }
              `}
            >
              PDFs ({pdfCount})
            </button>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, course, topic…"
            className="w-full md:w-80 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredNotes.length > 0 ? (
          <div className="space-y-4">
            {filteredNotes.map((note) => {
              const isPdf = note.type === "pdf";
              const isScanned = note.type === "scanned";

              const isOwner = user.id === note.author_id;

              return (
                <div key={note.id} className="relative group bg-white rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-0.5 border border-gray-100 overflow-hidden">
                  <Link href={`/notes/${note.id}`} className="block p-5 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-12 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                        <div>
                          <div className="flex items-center gap-2">
                            {isOwner && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                <title>You created this note</title>
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            )}
                            <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                          </div>

                          <p className="text-sm text-gray-500 mt-2">{note.course} • {note.topic}</p>
                          <p className="text-sm text-gray-600 mt-3 max-w-full text-ellipsis overflow-hidden" style={{maxHeight: '3.2rem'}}>{note.content ? note.content.slice(0, 220) : ''}{note.content && note.content.length > 220 ? '...' : ''}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-sm text-gray-500">
                        <div className="text-right">
                          <div className="font-medium">{note.comment_count ?? 0} comments</div>
                          <div className="text-xs mt-1">{new Date(note.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="px-5 pb-4 flex items-center justify-between border-t border-gray-100">
                    <div>
                      <VoteButtons
                        noteId={note.id}
                        initialUpvotes={voteData[note.id]?.up || 0}
                        initialDownvotes={voteData[note.id]?.down || 0}
                        initialUserVote={voteData[note.id]?.userVote || null}
                      />
                    </div>

                    {isOwner && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          deleteNote(note.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Note"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500 bg-white rounded-lg shadow">
            No notes match your filter or search.
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-lg">Loading Dashboard...</div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
