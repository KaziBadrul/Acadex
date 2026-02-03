// components/NoteFetcher.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import MarkdownRenderer from "./MarkdownRenderer";
import VoteButtons from "./VoteButtons";
import { getNote } from "@/app/notes/actions";
import CommentSection from "./CommentSection";

interface NoteFetcherProps {
  noteId: number;
}

interface NoteData {
  id: number;
  title: string;
  content: string | null;
  course: string;
  topic: string;
  created_at: string;
  type: string | null; // <-- NEW
  file_url: string | null; // <-- NEW
  author_id: string; // To check ownership
  visibility: string;
  group_id: string | null;
  version: number;
  profiles: { username: string } | { username: string }[] | null;
}

export default function NoteFetcher({ noteId }: NoteFetcherProps) {
  const [note, setNote] = useState<NoteData | null>(null);
  const [sessionUser, setSessionUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchNoteData() {
      // 1. Auth check
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setSessionUser(session.user);

      // 2. Fetch note using server action (RLS bypass)
      const res = await getNote(noteId);

      if (res.error || !res.note) {
        console.error("Fetch Error:", res.error);
        setError("Note not found.");
        setLoading(false);
        return;
      }

      const noteData = res.note as any;

      // 3. Access control check
      if (noteData.visibility === "private" && noteData.author_id !== session.user.id) {
        setError("This note is private.");
      } else if (noteData.visibility === "group") {
        // Check membership
        const { data: membership } = await supabase
          .from("group_members")
          .select("*")
          .eq("group_id", noteData.group_id)
          .eq("user_id", session.user.id)
          .single();

        if (!membership && noteData.author_id !== session.user.id) {
          setError("You do not have access to this group note.");
        } else {
          setNote(noteData as NoteData);
        }
      } else {
        setNote(noteData as NoteData);
      }

      setLoading(false);
    }

    fetchNoteData();
  }, [noteId, supabase, router]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Note...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">{error}</div>
    );
  }

  if (!note) {
    return (
      <div className="p-8 text-center text-red-600">
        Note data could not be retrieved.
      </div>
    );
  }

  // Author resolution (unchanged)
  const authorUsername = Array.isArray(note.profiles)
    ? note.profiles[0]?.username
    : note.profiles?.username || "Unknown User";

  const isPdf = note.type === "pdf" && !!note.file_url;

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-extrabold mb-2 text-gray-900">
          {note.title}
        </h1>

        <div className="text-lg text-gray-600 mb-6 border-b pb-4">
          <p>
            By{" "}
            <span className="font-semibold text-blue-600">
              {authorUsername}
            </span>{" "}
            in <span className="font-semibold">{note.course}</span> (
            {note.topic})
          </p>
          <div className="flex items-center gap-4 text-sm mt-1">
            <p>
              Published: {new Date(note.created_at).toLocaleDateString()}
            </p>
            <span className="text-gray-400">•</span>
            <p className="font-medium text-gray-700">
              Version {note.version}
            </p>
          </div>
          <div className="mt-4">
            <VoteButtons noteId={note.id} />
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        {/* ===== CONTENT ===== */}
        {isPdf ? (
          <div className="bg-white rounded-xl shadow p-4 relative">
            {/* Delete button for PDF */}
            {sessionUser?.id === note.author_id && (
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Link
                  href={`/notes/${noteId}/edit`}
                  className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow transition text-sm font-medium"
                >
                  Edit Metadata
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm("Are you sure you want to delete this note?")) return;
                    const { error } = await supabase.from("notes").delete().eq("id", noteId);
                    if (error) {
                      alert("Error deleting note");
                      console.error(error);
                    } else {
                      router.push("/dashboard");
                    }
                  }}
                  className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-md shadow transition text-sm font-medium"
                >
                  Delete Note
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-500">PDF Document</p>
              <a
                href={note.file_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                Open in new tab
              </a>
            </div>

            <iframe
              src={note.file_url!}
              className="w-full h-[800px] border rounded"
              title="PDF Viewer"
            />
          </div>
        ) : (
          <div className="relative">
            {/* Delete button for Markdown Note */}
            {sessionUser?.id === note.author_id && (
              <div className="absolute -top-12 right-0 flex gap-2">
                <Link
                  href={`/notes/${noteId}/edit`}
                  className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow transition text-sm font-medium"
                >
                  Edit Note
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm("Are you sure you want to delete this note?")) return;
                    const { error } = await supabase.from("notes").delete().eq("id", noteId);
                    if (error) {
                      alert("Error deleting note");
                      console.error(error);
                    } else {
                      router.push("/dashboard");
                    }
                  }}
                  className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-md shadow transition text-sm font-medium"
                >
                  Delete Note
                </button>
              </div>
            )}
            <MarkdownRenderer markdown={note.content ?? ""} />
          </div>
        )}

        {/* Comment Section (Excluded for Private Notes) */}
        {note.visibility !== "private" && (
          <CommentSection noteId={note.id} currentUser={sessionUser} />
        )}
      </div>
    </div>
  );
}
