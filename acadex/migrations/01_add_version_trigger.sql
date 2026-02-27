-- Migration: Add automatic version incrementing for notes
-- This trigger automatically increments the version number whenever a note is updated

CREATE OR REPLACE FUNCTION increment_note_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_version_increment
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION increment_note_version();
