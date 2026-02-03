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
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

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

      const profile = await getProfile(user.id);
      setUser({ id: user.id, username: profile?.username || "User" });

      const { data: memberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      const groupIds: string[] =
        memberships?.map((m: { group_id: string }) => m.group_id) || [];

      setMyGroupIds(groupIds);

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
          else if (note.visibility === "private")
            hasAccess = note.author_id === user.id;
          else if (note.visibility === "group") {
            hasAccess =
              groupIds.includes(note.group_id as string) ||
              note.author_id === user.id;
          }

          if (!hasAccess) return false;
          if (groupFilter && note.group_id !== groupFilter) return false;

          return true;
        });

        setNotes(filtered);

        const noteIds: number[] = filtered.map((n:Note) => n.id);

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

            noteIds.forEach((id: number) => {
              vData[id] = { up: 0, down: 0, userVote: null };
            });

            votes.forEach(
              (v: {
                note_id: number;
                vote_type: 1 | -1;
                user_id: string;
              }) => {
                if (!vData[v.note_id]) return;

                if (v.vote_type === 1) vData[v.note_id].up++;
                if (v.vote_type === -1) vData[v.note_id].down++;

                if (v.user_id === user.id) {
                  vData[v.note_id].userVote = v.vote_type;
                }
              }
            );

            setVoteData(vData);
          }

          const { data: commentCounts } = await supabase
            .from("note_comments")
            .select("note_id")
            .in("note_id", noteIds);

          if (commentCounts) {
            const cData: Record<number, number> = {};

            noteIds.forEach((id: number) => {
              cData[id] = 0;
            });

            commentCounts.forEach((c: { note_id: number }) => {
              if (cData[c.note_id] !== undefined) {
                cData[c.note_id]++;
              }
            });

            setNotes((prev) =>
              prev.map((n) => ({
                ...n,
                comment_count: cData[n.id] || 0,
              }))
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

    if (!error) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const pdfCount = notes.filter((n) => n.type === "pdf").length;
  const noteCount = notes.length - pdfCount;

  const filteredNotes = notes.filter((note) => {
    const isPdf = note.type === "pdf";

    if (filter === "pdfs" && !isPdf) return false;
    if (filter === "notes" && isPdf) return false;
    if (visibilityFilter !== "all" && note.visibility !== visibilityFilter)
      return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !`${note.title} ${note.course} ${note.topic}`
          .toLowerCase()
          .includes(q)
      )
        return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-lg">Loading Dashboard...</div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-10 border-b pb-6">
          <img
            src="/acadexLogo.png"
            alt="Acadex Logo"
            width="200"
            className="drop-shadow-sm"
          />
          <Link
            href="/settings"
            className="p-2 rounded-full hover:bg-gray-200 transition"
            title="Settings"
          >
            ⚙️
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Total Available Notes</p>
            <p className="text-4xl font-extrabold mt-1">{notes.length}</p>
            <Link
              href="/notes/create"
              className="block mt-4 text-blue-600 font-medium"
            >
              ➕ Create New Note
            </Link>
            <Link
              href="/notes/upload"
              className="block mt-2 text-blue-600 font-medium"
            >
              📥 Upload New Note
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Quick Actions</p>
            <div className="mt-3 space-y-2">
              <Link href="/schedule">🗓️ View Schedule</Link>
              <Link href="/resources">📚 Resource Repository</Link>
              <Link href="/reminder/set">⏰ Set Reminder</Link>
              <Link href="/reminder">🔔 View Reminder</Link>
              <Link href="/groups" className="font-bold">
                👥 Manage Groups
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">User Profile</p>
            <p className="font-bold text-lg">{user.username}</p>
            <p className="text-xs font-mono text-gray-400 truncate">
              {user.id}
            </p>
          </div>
        </div>

        {filteredNotes.length === 0 && (
          <div className="p-12 bg-white rounded-2xl shadow-sm text-center text-gray-500">
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
        <div className="p-12 text-center text-lg">
          Loading Dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
