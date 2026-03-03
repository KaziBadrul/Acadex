# Acadex — Frontend vs Backend files

This file lists which parts of the `acadex/` folder are frontend, backend, shared, or static/config. Use the links to inspect files in the workspace.

**Frontend**
- [acadex/app](acadex/app) : Next.js App Router pages and layouts (React UI)
  - [acadex/app/page.tsx](acadex/app/page.tsx)
  - [acadex/app/layout.tsx](acadex/app/layout.tsx)
  - [acadex/app/globals.css](acadex/app/globals.css)
  - Pages (React UI):
    - [acadex/app/dashboard/page.tsx](acadex/app/dashboard/page.tsx)
    - [acadex/app/focus/page.tsx](acadex/app/focus/page.tsx)
    - [acadex/app/transcription/page.tsx](acadex/app/transcription/page.tsx)
    - [acadex/app/some/page.tsx](acadex/app/some/page.tsx)
    - [acadex/app/smart-snap/page.tsx](acadex/app/smart-snap/page.tsx)
    - [acadex/app/groups/page.tsx](acadex/app/groups/page.tsx)
    - [acadex/app/groups/[id]/page.tsx](acadex/app/groups/[id]/page.tsx)
    - [acadex/app/notes/create/page.tsx](acadex/app/notes/create/page.tsx)
    - [acadex/app/notes/[id]/page.tsx](acadex/app/notes/[id]/page.tsx)
    - [acadex/app/login/page.tsx](acadex/app/login/page.tsx)
    - [acadex/app/resources/page.tsx](acadex/app/resources/page.tsx)
    - [acadex/app/resources/[id]/page.tsx](acadex/app/resources/[id]/page.tsx)
    - [acadex/app/requests/page.tsx](acadex/app/requests/page.tsx) and [acadex/app/requests/create/page.tsx](acadex/app/requests/create/page.tsx)
    - [acadex/app/notes/upload/page.tsx](acadex/app/notes/upload/page.tsx) and handwriting upload pages

- [acadex/components](acadex/components) : React components used by the pages (frontend UI)
  - Examples: [acadex/components/AppShell.tsx](acadex/components/AppShell.tsx), [acadex/components/NoteForm.tsx](acadex/components/NoteForm.tsx), [acadex/components/NotesFeed.tsx](acadex/components/NotesFeed.tsx), [acadex/components/CommentSection.tsx](acadex/components/CommentSection.tsx), [acadex/components/HandwritingPad.tsx](acadex/components/HandwritingPad.tsx)
  - Subfolders: [acadex/components/nexus](acadex/components/nexus), [acadex/components/smart-snap](acadex/components/smart-snap)

- [acadex/public](acadex/public) : Static assets served to the browser (images, sw.js, uploads)
  - [acadex/public/sw.js](acadex/public/sw.js)
  - [acadex/public/uploads](acadex/public/uploads) (static uploaded files)

**Backend**
- [acadex/app/api](acadex/app/api) : Next.js API route handlers (server-side)
  - [acadex/app/api/uploadpdf/route.ts](acadex/app/api/uploadpdf/route.ts)
  - [acadex/app/api/comments/[id]/route.ts](acadex/app/api/comments/[id]/route.ts)
  - [acadex/app/api/ocr/route.ts](acadex/app/api/ocr/route.ts)
  - [acadex/app/api/ocrcloudinary/route.ts](acadex/app/api/ocrcloudinary/route.ts)
  - [acadex/app/api/handwriting-ocr/route.ts](acadex/app/api/handwriting-ocr/route.ts)
  - [acadex/app/api/handwriting-upload/route.tsx](acadex/app/api/handwriting-upload/route.tsx)
  - [acadex/app/api/upload/route.ts](acadex/app/api/upload/route.ts)
  - [acadex/app/api/routine/ingest/route.ts](acadex/app/api/routine/ingest/route.ts)
  - [acadex/app/api/comments/resource/[id]/route.ts](acadex/app/api/comments/resource/[id]/route.ts)

- Server utilities and DB helpers (server-side):
  - [acadex/utils/supabase/server.ts](acadex/utils/supabase/server.ts) — server Supabase client
  - [acadex/utils/supabase/client.ts](acadex/utils/supabase/client.ts) — client-side Supabase helper (client vs server)
  - [acadex/lib/ocr.ts](acadex/lib/ocr.ts), [acadex/lib/parseRoutine.ts](acadex/lib/parseRoutine.ts), [acadex/lib/push.ts](acadex/lib/push.ts) — backend helpers used by API routes or server processes
  - [acadex/lib/utils.ts](acadex/lib/utils.ts) and [acadex/lib/types.ts](acadex/lib/types.ts) — utilities and types; often server-side or shared

- Database migrations and SQL (backend DB schema)
  - [acadex/migrations/00_initial_schema.sql](acadex/migrations/00_initial_schema.sql)
  - [acadex/migrations/01_add_groups_and_reminders.sql](acadex/migrations/01_add_groups_and_reminders.sql)
  - [acadex/migrations/02_add_group_id_to_notes.sql](acadex/migrations/02_add_group_id_to_notes.sql)
  - [acadex/migrations/03_add_group_chat.sql](acadex/migrations/03_add_group_chat.sql)
  - [acadex/migrations/add_resource_comments.sql](acadex/migrations/add_resource_comments.sql)
  - [acadex/migrations/check_policies.sql](acadex/migrations/check_policies.sql)

- Server-ish config / Dev helpers
  - [acadex/proxy.ts](acadex/proxy.ts) — dev proxy/server helper (backend tooling)
  - [acadex/next.config.ts](acadex/next.config.ts) — Next.js configuration (affects build/runtime)

**Shared / Ambiguous (shared code used by both)**
- Type definitions and shared utilities
  - [acadex/types/supabase.ts](acadex/types/supabase.ts)
  - [acadex/types/supabase_backup.ts](acadex/types/supabase_backup.ts)
  - [acadex/lib/types.ts](acadex/lib/types.ts)

- Some files in `lib/` can be used both client- and server-side depending on import-site; treat them as shared unless they import server-only APIs.

**Project config & tooling (neither frontend nor backend runtime)**
- [acadex/package.json](acadex/package.json)
- [acadex/tsconfig.json](acadex/tsconfig.json)
- [acadex/tailwind.config.js](acadex/tailwind.config.js)
- [acadex/postcss.config.mjs](acadex/postcss.config.mjs)
- [acadex/eslint.config.mjs](acadex/eslint.config.mjs)
- [acadex/README.md](acadex/README.md)

---

Notes & guidance
- Anything under `acadex/app/api/**` is backend (Next.js server route). Anything under `acadex/app/**/page.tsx`, `layout.tsx`, and `acadex/components/**` is frontend UI.
- `acadex/utils/supabase/server.ts` and SQL migrations are clearly backend. `acadex/utils/supabase/client.ts` is client-side helper.
- Files in `acadex/lib/` or `acadex/types/` may be shared; inspect imports to determine runtime usage.

If you want, I can update this file to include every single file path verbatim, or mark individual files as "shared" vs "strictly server" by scanning imports. Which would you prefer?
