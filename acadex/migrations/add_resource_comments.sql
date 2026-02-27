-- Migration: Add resource_id to comments table
-- This allows comments to be associated with either notes or resources

-- Add resource_id column
ALTER TABLE comments ADD COLUMN resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE;

-- Add check constraint to ensure exactly one of note_id or resource_id is set
ALTER TABLE comments ADD CONSTRAINT comments_target_check 
  CHECK (
    (note_id IS NOT NULL AND resource_id IS NULL) OR 
    (note_id IS NULL AND resource_id IS NOT NULL)
  );

-- Add index for performance when querying comments by resource
CREATE INDEX idx_comments_resource_id ON comments(resource_id);

-- Update existing comments to ensure they comply with the new constraint
-- (All existing comments should have note_id set, so this is just a safety check)
UPDATE comments SET note_id = note_id WHERE note_id IS NOT NULL;
