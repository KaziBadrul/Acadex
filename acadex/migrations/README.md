# Database Migration Instructions

To enable resource comments, you need to run the SQL migration in your Supabase database.

## Steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project: `zgxqvehfrgtvqccppjyd`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Copy the contents of `migrations/add_resource_comments.sql`
   - Paste into the SQL editor
   - Click "Run" to execute the migration

4. **Verify the Migration**
   - Go to "Table Editor" in the left sidebar
   - Select the `comments` table
   - Verify that the `resource_id` column exists
   - Check that the constraint and index were created

## What the Migration Does:

- Adds a `resource_id` column to the `comments` table
- Creates a foreign key relationship to the `resources` table
- Adds a check constraint to ensure each comment is associated with either a note OR a resource (but not both)
- Creates an index on `resource_id` for better query performance

## After Migration:

Once the migration is complete, the resource comments feature will be fully functional. You can:
- Navigate to `/resources` to see all resources
- Click on any resource to view its details
- Add, edit, and delete comments on resources
