// components/NoteFetcher.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; // <-- Uses the stable client utility
import MarkdownRenderer from './MarkdownRenderer';

interface NoteFetcherProps {
  noteId: number;
}

// Define the shape of the data we expect to receive
interface NoteData {
  id: number;
  title: string;
  content: string;
  course: string;
  topic: string;
  created_at: string;
  profiles: { username: string } | { username: string }[] | null;
}

export default function NoteFetcher({ noteId }: NoteFetcherProps) {
  const [note, setNote] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter(); 

  useEffect(() => {
    async function fetchNote() {
      // 1. Check Auth State before fetching (Ensures protection)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
          // If not logged in, redirect them to the login page
          router.push('/login');
          return;
      }
      
      // 2. Fetch the Note Data (Client-side API call)
      const { data: noteData, error: fetchError } = await supabase
        .from("notes")
        .select("id, title, content, course, topic, created_at, profiles(username)")
        .eq("id", noteId)
        .single();

      if (fetchError) {
        console.error("Fetch Error:", fetchError);
        // The error here will usually be RLS denial or 404
        setError("Note not found or you do not have permission to view it.");
      } else if (noteData) {
        setNote(noteData as NoteData);
      }
      setLoading(false);
    }

    fetchNote();
  }, [noteId, supabase, router]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Note...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-600 font-semibold">{error}</div>;
  }

  if (!note) {
      return <div className="p-8 text-center text-red-600">Note data could not be retrieved.</div>;
  }

  // 3. Format and Render
  const authorUsername = Array.isArray(note.profiles)
    ? note.profiles[0]?.username
    : (note.profiles as { username: string } | null)?.username ||
      "Unknown User";

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
          <p className="text-sm mt-1">
            Published: {new Date(note.created_at).toLocaleDateString()}
          </p>
        </div>

        <MarkdownRenderer markdown={note.content} />
      </div>
    </div>
  );
}