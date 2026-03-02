"use client";

import FlashcardStack from "./smart-snap/FlashcardStack";
import { useRouter } from "next/navigation";

export type StudyCard = {
  id: string;
  front: string;
  back: string;
};

interface DeckReviewProps {
  cards: StudyCard[];
  backTo?: string;
}

export default function DeckReview({ cards, backTo = "/" }: DeckReviewProps) {
  const router = useRouter();
  return (
    <FlashcardStack
      cards={cards}
      onReset={() => {
        router.push(backTo);
      }}
    />
  );
}
