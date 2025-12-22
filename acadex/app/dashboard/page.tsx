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
  type: string | null; // 👈 important
}

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null
  );

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

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotes(data as Note[]);
      }

      setLoading(false);
    }

    fetchData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

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
            className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition"
          >
            Log Out
          </button>
        </div>

        {/* Notes List */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
          All Available Notes
        </h2>

        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => {
              const isPdf = note.type === "pdf";

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

                      {/* 👇 SMALL PDF TAG */}
                      {isPdf && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold border border-red-500 text-red-600 rounded">
                          PDF
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
            No notes found. Create the first one! 📝
          </div>
        )}
      </div>
    </div>
  );
}
