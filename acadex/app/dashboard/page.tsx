"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

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
    null
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      setUser({ id: user.id, username: profile?.username || "User" });

      const { data: allNotes, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && allNotes) {
        setNotes(allNotes as Note[]);
      }

      setLoading(false);
    }

    fetchData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
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
            Welcome, <span className="text-blue-600">{user.username}!</span>
          </h1>
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition"
          >
            Log Out
          </button>
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
            <p className="text-sm font-medium text-gray-500">User ID</p>
            <p className="font-mono text-sm truncate">{user.id}</p>
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
                ${
                  filter === "all"
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
                ${
                  filter === "notes"
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
                ${
                  filter === "pdfs"
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

              return (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="block"
                >
                  <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
                    <h3 className="text-xl font-bold text-blue-600">
                      {note.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-1">
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
                    </p>
                  </div>
                </Link>
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
