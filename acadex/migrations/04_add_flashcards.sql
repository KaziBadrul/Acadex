-- migrations/04_add_flashcards.sql

-- Add tables for flashcard decks and individual flashcards

CREATE TABLE flashcard_decks (
    id SERIAL PRIMARY KEY,
    note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE flashcards (
    id SERIAL PRIMARY KEY,
    deck_id INTEGER REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    mastered BOOLEAN DEFAULT FALSE,
    last_reviewed TIMESTAMPTZ,
    review_count INTEGER DEFAULT 0
);
