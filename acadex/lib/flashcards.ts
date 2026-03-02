// lib/flashcards.ts

// Utility logic for generating simple flashcards heuristically.  This is
// essentially a copy of the algorithm that was previously in
// `components/smart-snap/SnapGenerator.tsx`.  Keeping it here lets us reuse it
// from the server action when the Gemini call fails or no API key is present.

export type QA = { q: string; a: string };

export function heuristicGenerate(sourceText: string): QA[] {
  const sentences = sourceText.match(/[^.!?]+[.!?]+/g) || [sourceText];
  const newCards: QA[] = [];

  sentences.forEach((sentence, idx) => {
    const clean = sentence.trim();
    if (clean.length < 10) return; // Skip too short

    // Strategy 1: Find definitions (contains " is ", " are ", " means ")
    const defMatch = clean.match(/^(.*?) (is|are|means|refers to) (.*)$/i);

    if (defMatch) {
      const term = defMatch[1];
      const body = defMatch[2] + " " + defMatch[3];
      if (term.split(" ").length < 5) {
        newCards.push({ q: `___ ${body}`, a: term });
        return;
      }
    }

    // Strategy 2: Keyword blanking (long word >5 chars)
    const words = clean.split(" ");
    const candidates = words.filter(
      (w) => w.length > 5 && !/^(this|that|there|which|because|although)/i.test(w)
    );

    if (candidates.length > 0) {
      const wordToRemove = candidates[Math.floor(Math.random() * candidates.length)];
      const q = clean.replace(wordToRemove, "[_____]" );
      newCards.push({ q, a: wordToRemove.replace(/[.,!?]/g, "") });
    }
  });

  return newCards.length > 0
    ? newCards
    : [{ q: "Could not generate cards.", a: "Try simpler text." }];
}
