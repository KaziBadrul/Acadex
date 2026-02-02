-- Add group_id to notes table
ALTER TABLE notes 
ADD COLUMN group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_notes_group_id ON notes(group_id);

-- Update RLS policies for notes to include group access
-- Notes are viewable if:
-- 1. They are public
-- 2. The user is the author
-- 3. The user is a member of the group the note belongs to

DROP POLICY "Public notes are viewable by everyone" ON notes;

CREATE POLICY "Notes visibility policy"
  ON notes FOR SELECT
  USING (
    visibility = 'public' 
    OR auth.uid() = author_id
    OR (
      visibility = 'group' 
      AND group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Allow creating notes in groups if user is a member
DROP POLICY "Authenticated users can create notes" ON notes;

CREATE POLICY "Authenticated users can create notes"
  ON notes FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND (
      group_id IS NULL 
      OR group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );
