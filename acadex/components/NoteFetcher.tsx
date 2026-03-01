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
import { FileText, Edit3, Trash2, ExternalLink, Calendar, GitCommit, User as UserIcon, BookOpen, Clock, AlertCircle } from "lucide-react";

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
  type: string | null;
  file_url: string | null;
  author_id: string;
  visibility: string;
  group_id: string | null;
  version: number;
  profiles: { username: string } | { username: string }[] | null;
}

function NoteSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8 animate-pulse">
      <div className="space-y-4 border-b border-muted/20 pb-8">
        <div className="h-12 w-3/4 bg-muted/20 rounded-2xl"></div>
        <div className="flex gap-4">
          <div className="h-6 w-32 bg-muted/20 rounded-lg"></div>
          <div className="h-6 w-48 bg-muted/20 rounded-lg"></div>
        </div>
      </div>
      <div className="space-y-4 pt-4">
        <div className="h-4 w-full bg-muted/10 rounded-md"></div>
        <div className="h-4 w-full bg-muted/10 rounded-md"></div>
        <div className="h-4 w-5/6 bg-muted/10 rounded-md"></div>
        <div className="h-4 w-4/6 bg-muted/10 rounded-md"></div>
      </div>
    </div>
  );
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
    return <NoteSkeleton />;
  }

  if (error || !note) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Notice</h3>
        <p className="text-primary/60 mb-6 max-w-sm">{error || "Note data could not be retrieved."}</p>
        <Link href="/notes" className="px-6 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all">
          Back to Notes
        </Link>
      </div>
    );
  }

  // Author resolution
  const authorUsername = Array.isArray(note.profiles)
    ? note.profiles[0]?.username
    : note.profiles?.username || "Unknown User";

  const isPdf = note.type === "pdf" && !!note.file_url;
  const isAuthor = sessionUser?.id === note.author_id;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) return;
    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    if (error) {
      alert("Error deleting note: " + error.message);
      console.error(error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Notion-style header block */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-8">
        {/* Breadcrumb / Top Meta */}
        <div className="flex items-center gap-2 text-sm text-primary/40 font-medium mb-6">
          <BookOpen className="w-4 h-4" />
          <span>{note.course || 'Uncategorized'}</span>
          <span className="text-primary/20">/</span>
          <span>{note.topic || 'General'}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-primary tracking-tight leading-tight">
          {note.title}
        </h1>

        <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-sm text-primary/60 border-b border-muted/20 pb-8 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-primary">{authorUsername}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary/40" />
            <span>{new Date(note.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-primary/40" />
            <span>v{note.version}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <VoteButtons noteId={note.id} />
          </div>
        </div>

        {/* Action Bar (Only visible to author) */}
        {isAuthor && (
          <div className="flex justify-end gap-3 mb-8">
            <Link
              href={`/notes/${noteId}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-muted/10 hover:bg-muted/20 text-primary font-medium rounded-xl transition-all text-sm"
            >
              <Edit3 className="w-4 h-4" /> Edit {isPdf ? 'Metadata' : 'Note'}
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-all text-sm"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}

        {/* ===== CONTENT ===== */}
        <div className="prose prose-slate max-w-none">
          {isPdf ? (
            <div className="bg-card rounded-2xl shadow-subtle border border-muted/20 p-2 md:p-4 relative">
              <div className="flex justify-between items-center mb-4 px-2 pt-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary/60">
                  <FileText className="w-4 h-4" />
                  PDF Document
                </div>
                <a
                  href={note.file_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-accent font-medium text-sm hover:underline px-3 py-1.5 bg-accent/10 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Open Full
                </a>
              </div>
              <iframe
                src={note.file_url!}
                className="w-full h-[75vh] min-h-[600px] border border-muted/10 rounded-xl bg-background"
                title="PDF Viewer"
              />
            </div>
          ) : (
            <div className="bg-card rounded-2xl md:p-12 p-6 shadow-subtle border border-muted/20 font-inter leading-relaxed">
              {/* Minimal styling applied via Tailwind Prose in a parent context or custom markdown renderer */}
              <MarkdownRenderer markdown={note.content ?? ""} />
            </div>
          )}
        </div>

        {/* ===== COMMENTS ===== */}
        {note.visibility !== "private" && (
          <div className="mt-16 border-t border-muted/20 pt-16">
            <h3 className="text-2xl font-bold text-primary mb-8 tracking-tight">Discussion</h3>
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-subtle border border-muted/20">
              <CommentSection noteId={note.id} currentUser={sessionUser} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
