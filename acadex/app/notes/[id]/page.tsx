// app/notes/[id]/page.tsx
// This is an async Server Component for secure data fetching.

import { createServer } from "@/utils/supabase/server"; // <-- Import the clean utility
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface NotePageProps {
  params: {
    id: string;
  };
}

export default async function NotePage({ params }: NotePageProps) {
  // 1. Initialize the client using the utility
  const supabase = createServer();

  // 2. Validate and convert the URL ID
  const noteId = parseInt(params.id, 10);

  if (isNaN(noteId)) {
    return (
      <div className="p-8 text-center text-red-600">
        Error: Invalid Note ID specified in the URL.
      </div>
    );
  }

  // 3. Fetch the note data
  const { data: note, error } = await supabase
    .from("notes")
    .select("id, title, content, course, topic, created_at, profiles(username)")
    .eq("id", noteId)
    .single();

  if (error || !note) {
    console.error("Fetch Error:", error);
    return (
      <div className="p-8 text-center text-red-600">
        Note not found or you do not have permission to view it. (Check RLS
        Policies)
      </div>
    );
  }

  // 4. Format and Render
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
