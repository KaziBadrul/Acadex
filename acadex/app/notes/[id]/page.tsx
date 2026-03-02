// app/notes/[id]/page.tsx

import NoteFetcher from "@/components/NoteFetcher";

interface NotePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const noteId = parseInt(id, 10);

  if (isNaN(noteId)) {
    return (
      <div className="p-8 text-center text-red-600">
        Error: Invalid Note ID specified in the URL. (Received: {id || 'nothing'})
      </div>
    );
  }


  return (
    <NoteFetcher noteId={noteId} />
  );
}