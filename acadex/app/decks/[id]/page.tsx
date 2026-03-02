// app/decks/[id]/page.tsx

import { getDeck } from "@/app/decks/actions";
import DeckReview from "@/components/DeckReview";
import { Metadata } from "next";

interface DeckPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Study Deck | Acadex",
};

export default async function DeckPage({ params }: DeckPageProps) {
  const { id } = await params;
  const deckId = parseInt(id, 10);
  if (isNaN(deckId)) {
    return <div className="p-8 text-center text-red-600">Invalid deck id</div>;
  }

  const { deck, error } = await getDeck(deckId);
  if (error || !deck) {
    return (
      <div className="p-8 text-center text-red-600">
        {error || "Deck not found"}
      </div>
    );
  }

  const cards = (deck.flashcards || []).map((c: any) => ({
    id: c.id.toString(),
    front: c.question,
    back: c.answer,
  }));

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-6">{deck.title}</h1>
        <DeckReview cards={cards} backTo={`/notes/${deck.note_id}`} />
      </div>
    </div>
  );
}
