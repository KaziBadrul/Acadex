"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import NoteFetcher from "@/components/NoteFetcher";

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
  group_id: number | null;
}

type FilterType = "all" | "public" | "private" | "group";

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
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

      // Fetch Groups
      const { data: membershipData } = await supabase
        .from("group_members")
        .select(`groups (id, name)`)
        .eq("user_id", user.id);

      if (membershipData) {
        const groups = membershipData.map((m: any) => m.groups);
        setUserGroups(groups);
      }

      const { data: allNotes, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && allNotes) {
        // Ensure legacy notes have default visibility if missing
        const typedNotes = allNotes.map(n => ({
          ...n,
          visibility: n.visibility || 'public'
        })) as Note[];
        setNotes(typedNotes);
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
  const filteredNotes = notes.filter((note) => {
    // 1. Visibility Filter
    if (filter === "all") {
      // Show everything the user has access to
    } else if (filter === "public") {
      if (note.visibility !== "public") return false;
    } else if (filter === "private") {
      if (note.visibility !== "private" || note.author_id !== user?.id) return false;
    } else if (filter === "group") {
      if (note.visibility !== "group") return false;
      if (selectedGroupId && note.group_id !== selectedGroupId) return false;
    }

    // 2. Search Filter
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
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Acadex Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-500 font-medium transition flex items-center gap-2"
          >
            <span>Log out</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">
              Total Available Notes
            </p>
            <p className="text-4xl font-bold text-gray-900 mt-2">
              {notes.length}
            </p>
            <div className="mt-4 flex flex-col space-y-2">
              <Link
                href="/notes/create"
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                + Create New Note
              </Link>
              <Link
                href="/notes/upload"
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
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
                href="/reminders/create"
                className="block text-green-500 hover:underline"
              >
                ⏰ Set Reminder
              </Link>
              <Link
                href="/reminders"
                className="block text-green-500 hover:underline"
              >
                🔔 View Reminders
              </Link>
              <Link
                href="/groups"
                className="block text-green-500 hover:underline"
              >
                👥 Manage Groups
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-500">User Profile</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {user.username}
            </p>
            <p className="font-mono text-xs text-gray-400 mt-1 truncate">
              ID: {user.id}
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            All Available Notes
          </h2>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

              {/* Left: Visibility Toggles */}
              <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                  Visibility:
                </span>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${filter === "all"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    ALL
                  </button>
                  <button
                    onClick={() => setFilter("public")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${filter === "public"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    PUBLIC
                  </button>
                  <button
                    onClick={() => setFilter("private")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${filter === "private"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    PRIVATE
                  </button>
                  <button
                    onClick={() => setFilter("group")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${filter === "group"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    GROUP
                  </button>
                </div>
              </div>

              {/* Middle: Group Selector */}
              {filter === "group" && (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Select Group:
                  </span>
                  <select
                    value={selectedGroupId || ""}
                    onChange={(e) => setSelectedGroupId(Number(e.target.value) || null)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-48"
                  >
                    <option value="">-- All Groups --</option>
                    {userGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Right: Search */}
              <div className="w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search title, course, topic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <NoteFetcher key={note.id} noteId={note.id} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 text-lg">
                No notes found matching your filters.
              </p>
              {filter === 'group' && userGroups.length === 0 && (
                <p className="text-sm text-blue-500 mt-2">
                  <Link href="/groups">Create or join a group</Link> to see group notes.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
