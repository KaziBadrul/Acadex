-- Complete Database Schema for Acadex
-- Run this in Supabase SQL Editor to create all tables

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'student',
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Notes table
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  course TEXT,
  topic TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  visibility TEXT DEFAULT 'public',
  version INTEGER DEFAULT 1,
  type TEXT, -- 'pdf', 'scanned', or NULL for regular notes
  file_url TEXT, -- URL for PDF files
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create full-text search index on notes
CREATE INDEX idx_notes_search ON notes USING GIN(search_vector);

-- Create trigger to update search_vector automatically
CREATE OR REPLACE FUNCTION notes_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.course, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.topic, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_search_update 
  BEFORE INSERT OR UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION notes_search_trigger();

-- 3. Resources table
CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  note_id INTEGER REFERENCES notes(id) ON DELETE SET NULL,
  uploader_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Comments table (supports both notes and resources)
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
  resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure exactly one of note_id or resource_id is set
  CONSTRAINT comments_target_check CHECK (
    (note_id IS NOT NULL AND resource_id IS NULL) OR 
    (note_id IS NULL AND resource_id IS NOT NULL)
  )
);

-- Create indexes for comments
CREATE INDEX idx_comments_note_id ON comments(note_id);
CREATE INDEX idx_comments_resource_id ON comments(resource_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- 5. Votes table
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote INTEGER CHECK (vote IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(note_id, user_id)
);

-- Create index for votes
CREATE INDEX idx_votes_note_id ON votes(note_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- 6. Note Requests table
CREATE TABLE note_requests (
  id SERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  course TEXT NOT NULL,
  description TEXT,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for note requests
CREATE INDEX idx_note_requests_requester_id ON note_requests(requester_id);
CREATE INDEX idx_note_requests_status ON note_requests(status);

-- 7. Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_requests ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Notes: Everyone can read public notes, authors can manage their own
CREATE POLICY "Public notes are viewable by everyone"
  ON notes FOR SELECT
  USING (visibility = 'public' OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can create notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = author_id);

-- Resources: Everyone can read, uploaders can manage their own
CREATE POLICY "Resources are viewable by everyone"
  ON resources FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload resources"
  ON resources FOR INSERT
  WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Uploaders can update their own resources"
  ON resources FOR UPDATE
  USING (auth.uid() = uploader_id);

CREATE POLICY "Uploaders can delete their own resources"
  ON resources FOR DELETE
  USING (auth.uid() = uploader_id);

-- Comments: Everyone can read, users can manage their own
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Votes: Everyone can read, users can manage their own
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON votes FOR DELETE
  USING (auth.uid() = user_id);

-- Note Requests: Everyone can read, users can manage their own
CREATE POLICY "Note requests are viewable by everyone"
  ON note_requests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create note requests"
  ON note_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requesters can update their own requests"
  ON note_requests FOR UPDATE
  USING (auth.uid() = requester_id);

CREATE POLICY "Requesters can delete their own requests"
  ON note_requests FOR DELETE
  USING (auth.uid() = requester_id);

-- 9. Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
