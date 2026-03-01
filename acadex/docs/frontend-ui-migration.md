# Frontend UI Migration Plan

## 1. Repo Audit

### Current Frontend Tech
- **Framework:** Next.js 15 (App Router). The root directory is `acadex/app/`.
- **Styling:** Tailwind CSS V4 + Shadcn UI.
- **Key Components Found:** `AuthForm.tsx`, `NoteForm.tsx`, `NoteFetcher.tsx`, `VoteButtons.tsx`, `CommentSection.tsx`, `GroupChat.tsx`, and `Tiptap.tsx` (rich text).
- **Database/Auth:** Supabase SSR client is used.

### Existing Server Actions and API Routes
Based on the file structure in `acadex/app/`:
- **API Routes (`acadex/app/api/`):**
  - `/api/uploadpdf`
  - `/api/ocrcloudinary`
  - `/api/handwriting-ocr`
  - `/api/routine/` (specifically `ingest`)
  - `/api/comments/` (for resource-specific comments)
- **Server Actions:**
  - Likely located in `actions.ts` files inside routes like `notes/`, `groups/`, `settings/`.

## 2. Global Design System
The new UI will be premium, minimal, and follow a "Google Docs + Notion" aesthetic.
- **Palette:**
  - Primary/nav: `#30364f`
  - Muted/borders: `#acbac4`
  - Accent/hover/selected: `#e1d9bc`
  - Background: `#f0f0db`
- **Style:** 12-16px radius, calm, minimal shadows, 8px spacing scale, lots of whitespace.
- **Typography:** Inter (via `next/font/google`).
- **Components:** Standardize using Shadcn UI components already present (or add minimal ones if missing).

## 3. Implementation Steps
### Step 1: Unified Layout & Shell
- Modify `acadex/app/layout.tsx` to include an `AppShell`.
- Build a responsive Left Sidebar containing: Dashboard, Notes, Upload, Groups, Schedule, Settings.

### Step 2: Page-by-Page Redesign
1. **`/login`:** Update auth form aesthetics.
2. **`/dashboard`:** Show profile, group quick-links, and quick actions. Remove placeholders.
3. **`/groups` & `/groups/[id]`:** Update lists and chat interface.
4. **`/upload`:** Overhaul the multi-tab interface (PDF/OCR/Handwriting).
5. **`/notes` & `/notes/[id]`:** Create a minimalist document listing. Add a real notes listing server action if missing.
6. **`/schedule`:** Update routine viewer to be a "not saved, preview" interface.
7. **`/settings`:** Minimalist profile updater.

### Step 3: Backend Verification
- Ensure API routes (`uploadpdf`, `ocrcloudinary`) return note IDs to correctly redirect users.
- Connect existing Supabase server actions without reinventing endpoints.

### Step 4: Quality Checks
- Replace all placeholder states with empty states (with CTAs).
- Add skeleton loaders.
- Verify everything compiles cleanly under `npm run dev`.