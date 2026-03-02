// app/notes/[id]/generate/page.tsx

import { generateFlashcards, FlashcardResult } from "@/app/notes/actions";
import { redirect } from "next/navigation";

interface GeneratePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GeneratePage({ params }: GeneratePageProps) {
  const { id } = await params;
  const noteId = parseInt(id, 10);
  if (isNaN(noteId)) {
    return (
      <div className="p-8 text-red-600">
        Invalid note ID (&quot;{id}&quot;)
      </div>
    );
  }

  const res: FlashcardResult = await generateFlashcards(noteId);
  if ("error" in res) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Failed to generate flashcards</h1>
          <p className="mt-4 text-gray-700">{res.error}</p>
          <a
            href={`/notes/${noteId}`}
            className="mt-6 inline-block px-6 py-3 bg-primary text-white rounded-xl"
          >
            Back to Note
          </a>
        </div>
      </div>
    );
  }

  if (res.deck && res.deck.id) {
    // redirect to deck review page once creation succeeds
    redirect(`/decks/${res.deck.id}`);
  }

  // fallback
  redirect(`/notes/${noteId}`);
}
