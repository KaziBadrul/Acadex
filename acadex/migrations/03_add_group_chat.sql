-- Migration: Add Group Chat (Messenger)
-- 1. Create group_messages table
CREATE TABLE group_messages (
  id SERIAL PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;

-- 3. RLS Bypass Strategy: 
-- As requested, we will handle security in application logic by using the service role for DB ops.
-- However, for the client to receive Realtime updates, we need to allow SELECT for everyone
-- OR specific identities if we wanted to be stricter. 
-- Since the user asked to "bypass the RLS use clientSide", we'll disable RLS or make it permissive.
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for realtime support"
ON group_messages FOR SELECT
USING (true);

-- We'll still keep INSERT restricted to authenticated users if possible, 
-- but we'll mainly use the server action (supabaseServer) which bypasses this.
CREATE POLICY "Allow authenticated insert"
ON group_messages FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Index for performance
CREATE INDEX idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX idx_group_messages_created_at ON group_messages(created_at);

-- Set permissions
GRANT ALL ON group_messages TO authenticated;
GRANT USAGE ON SEQUENCE group_messages_id_seq TO authenticated;
