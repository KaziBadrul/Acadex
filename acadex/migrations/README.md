# Database Migration Instructions

This directory contains SQL migrations for the Acadex database. Run these migrations in your Supabase SQL Editor to add new features.

## Available Migrations:

### 1. Version Tracking (01_add_version_trigger.sql)
Automatically increments note versions when edited.

### 2. Resource Comments (add_resource_comments.sql)
Enables commenting on resources.

## Steps to Run a Migration:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project: `zgxqvehfrgtvqccppjyd`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Copy the contents of the migration file (e.g., `migrations/01_add_version_trigger.sql`)
   - Paste into the SQL editor
   - Click "Run" to execute the migration

4. **Verify the Migration**
   - Check the success message in the SQL editor
   - Verify that the changes were applied correctly

---

## Migration Details:

### Version Tracking (01_add_version_trigger.sql)
- Creates a database trigger that automatically increments the `version` field when a note is updated
- Updates the `updated_at` timestamp on each edit
- Ensures version numbers are always accurate and sequential

### Resource Comments (add_resource_comments.sql)
- Adds a `resource_id` column to the `comments` table
- Creates a foreign key relationship to the `resources` table
- Adds a check constraint to ensure each comment is associated with either a note OR a resource (but not both)
- Creates an index on `resource_id` for better query performance
