"use client";

import FlashcardStack from "./smart-snap/FlashcardStack";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, ChevronLeft } from "lucide-react";
import { deleteDeck } from "@/app/decks/actions";
import { useState } from "react";
import Link from "next/link";

export type StudyCard = {
  id: string;
  front: string;
  back: string;
};

interface DeckReviewProps {
  deckId: number;
  cards: StudyCard[];
  backTo?: string;
}

export default function DeckReview({ deckId, cards, backTo = "/" }: DeckReviewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entire deck?")) return;
    setIsDeleting(true);
    const res = await deleteDeck(deckId);
    if (res.success) {
      router.push(backTo);
    } else {
      alert("Error deleting deck: " + res.error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={backTo}
          className="flex items-center gap-2 text-primary/60 hover:text-primary font-medium transition-colors"
        >
          <ChevronLeft size={18} /> Back
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-all text-sm disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
          Delete Deck
        </button>
      </div>

      <FlashcardStack
        cards={cards}
        onReset={() => {
          router.push(backTo);
        }}
      />
    </div>
  );
}
