"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { getProfile } from "../settings/actions";
import VoteButtons from "@/components/VoteButtons";

interface Note {
  id: number;
  title: string;
  content: string;
  course: string;
  topic: string;
  created_at: string;
  author_id: string;
  type: string | null;
}

type FilterType = "all" | "notes" | "pdfs";

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null,
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const router = useRouter();
  const supabase = createClient();

  /* Vote State */
  const [voteData, setVoteData] = useState<Record<number, { up: number; down: number; userVote: 1 | -1 | null }>>({});

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

      const { data: allNotes, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && allNotes) {
        setNotes(allNotes as Note[]);

        // --- Fetch Votes for all notes ---
        const noteIds = allNotes.map((n) => n.id);
        if (noteIds.length > 0) {
          const { data: votes } = await supabase
            .from("note_votes")
            .select("*")
            .in("note_id", noteIds);

          if (votes) {
            const vData: Record<number, { up: number; down: number; userVote: 1 | -1 | null }> = {};

            // Initialize
            noteIds.forEach(id => {
              vData[id] = { up: 0, down: 0, userVote: null };
            });

            votes.forEach(v => {
              if (!vData[v.note_id]) return; // specific note redundant check

              if (v.vote_type === 1) vData[v.note_id].up++;
              else if (v.vote_type === -1) vData[v.note_id].down++;

              if (v.user_id === user.id) {
                vData[v.note_id].userVote = v.vote_type as 1 | -1;
              }
            });

            setVoteData(vData);
          }
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [router, supabase]);

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
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}

        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-4xl font-bold text-gray-900">
            <img src="/acadexLogo.png" alt="Acadex Logo" width="200" />
          </h1>

          <Link
            href="/settings"
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition"
            title="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
        </div>

        {/* --- Quick Stats and Actions --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">
              Total Available Notes
            </p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">
              {notes.length}
            </p>
            <div className="flex flex-col">
              <Link
                href="/notes/create"
                className="mt-4 text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                ➕ Create New Note
              </Link>
              <Link
                href="/notes/upload"
                className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                📥 Upload New Note
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-500">Quick Actions</p>
            <div className="mt-2 space-y-2">
              <Link
                href="/schedule"
                className="block text-green-500 hover:underline"
              >
                🗓️ View Schedule
              </Link>
              <Link
                href="/resources"
                className="block text-green-500 hover:underline"
              >
                📚 Resource Repository
              </Link>
              <Link
                href="/reminder/set"
                className="block text-green-500 hover:underline"
              >
                ⏰ Set Reminder
              </Link>
              <Link
                href="/reminder"
                className="block text-green-500 hover:underline"
              >
                🔔 View Reminder
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-500">User Profile</p>
            <p className="font-bold text-lg text-gray-900">{user.username}</p>
            <p className="font-mono text-sm truncate text-gray-400">ID: {user.id}</p>
          </div>
        </div>

        {/* --- Notes List --- */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-3 border-b pb-2">
          All Available Notes
        </h2>

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
                <div key={note.id} className="relative group bg-white rounded-lg shadow hover:shadow-md transition">
                  <Link
                    href={`/notes/${note.id}`}
                    className="block p-5 pb-2"
                  >
                    <div className="flex items-center gap-2">
                      {isOwner && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-600"
                        >
                          <title>You created this note</title>
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      )}
                      <h3 className="text-xl font-bold text-blue-600">
                        {note.title}
                      </h3>
                    </div>

                    <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-1">
                      <span className="font-semibold">Course:</span>
                      {note.course}
                      <span>|</span>

                      <span className="font-semibold">Topic:</span>
                      {note.topic}

                      {isPdf && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold border border-red-500 text-red-600 rounded">
                          PDF
                        </span>
                      )}

                      {isScanned && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold border border-green-500 text-green-600 rounded">
                          Scanned
                        </span>
                      )}

                      <span>|</span>
                      <span className="font-semibold">Created:</span>
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </Link>

                  <div className="px-5 pb-4 flex justify-between">
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
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Note"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500 bg-white rounded-lg shadow">
            No notes match your filter or search.
          </div>
        )
        }
      </div >
    </div >
  );
}
