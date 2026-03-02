# Acadex — Frontend Refactor Changelog

This document summarises every change made to the `acadex` frontend from the original cloned state.

---

## 1. Global Design System

### `app/globals.css`
- Defined CSS custom properties for the full color palette:
  - `--background`: `#f7f5e8` (warm cream)
  - `--foreground` / `--primary`: `#30364f` (dark navy)
  - `--muted`: `#acbac4`, `--accent`: `#e1d9bc`, `--card`: `#ffffff`
- Added `.dark` overrides — all tokens flip to dark equivalents when `<html class="dark">` is set
- Registered tokens into Tailwind v4's `@theme inline` block
- Added `body` transition (`0.3s ease`) for smooth dark/light switching
- Added `.shadow-subtle` utility class

### `app/layout.tsx`
- Added `Inter` font via `next/font/google`
- Added `suppressHydrationWarning` on `<html>` to prevent hydration mismatch from dark mode class
- Injected inline `<script>` inside `<head>` that reads `localStorage` before React hydrates and applies `dark` class — eliminates the white flash on page load
- Wrapped children in `AppShell`, `ThemeProvider`, and `ReminderNotificationProvider`

---

## 2. New Components

### `components/AppShell.tsx` *(new file)*
- Full-page layout shell with:
  - **Desktop**: fixed left sidebar (`w-64`, dark navy `#30364f`) with logo + nav links
  - **Mobile**: top header bar + hamburger menu that opens the sidebar as an overlay
- Sidebar is hardcoded to `bg-[#30364f]` so it stays dark in both light and dark themes
- Active route is highlighted with the `accent` token
- Logo: `public/ACADEX.png` displayed full-width in a square `aspect-square` brand area
- Sidebar nav items: Dashboard, Notes, Upload (`/notes/upload`), Groups, Schedule, Settings

---

## 3. Page Redesigns

All pages were refactored **in-place** — no pages were deleted, only restyled.

| Page | Key Changes |
|---|---|
| `/login` | Centered auth card, loading spinner on submit |
| `/dashboard` | Skeleton loader, lucide-react icons, real group/note counts, empty states with CTAs |
| `/groups` | Card grid, skeleton loader, join/create modals with improved inputs |
| `/groups/[id]` | Two-column layout (member sidebar + chat), skeleton, group info panel |
| `/notes` | **New page** — searchable card grid, skeleton, empty state CTA |
| `/notes/[id]` | Notion-style header, `bg-background` wrapper (dark-mode aware), prose content |
| `/notes/upload` | Drag-and-drop zone, success → redirects to new note page |
| `/schedule` | Drag-and-drop file zone, FullCalendar preview |
| `/settings` | Profile edit card, dark mode toggle, danger zone sign-out section |

---

## 4. Component Refactors

### `components/MarkdownRenderer.tsx`
- Removed hardcoded `bg-white text-black` wrapper
- Now uses `prose-slate dark:prose-invert` — Tailwind Typography's dark mode support (headings, lists, code blocks, blockquotes all flip automatically)

### `components/NoteFetcher.tsx`
- Replaced hardcoded `bg-[#fcfcfc]` page wrapper with `bg-background`
- Replaced `text-gray-*` error state classes with theme tokens (`text-foreground`, `text-primary/60`)
- Skeleton loader added

### `components/GroupChat.tsx`
- Replaced emoji indicators with `lucide-react` icons
- Updated message bubbles to use theme tokens
- Added loading state with animated spinner

### `components/CommentSection.tsx`
- Replaced emoji icons with `lucide-react`
- Updated layout and colors to use theme tokens

### `components/AuthForm.tsx`
- Added loading spinner state on submit button
- Updated input/button styles to use theme tokens

---

## 5. Backend Additions & Fixes

### `app/notes/actions.ts`
- **Added `getNotes()`** server action — fetches all notes from Supabase with author profiles, ordered by `created_at` desc. Powers the new `/notes` listing page.

### `app/api/uploadpdf/route.ts`
- Changed `.insert()` to `.insert().select("id").single()` so the API returns the new note's `id`
- Frontend now redirects to `/notes/:id` after a successful PDF upload instead of just showing a success message

---

## 6. Dark Mode

- Toggle lives in **Settings** and saves preference to `localStorage`
- The inline `<head>` script applies the `dark` class before React renders (no flash)
- All `bg-white` card/panel classes replaced with `bg-card` (flips to `#272b3d` in dark)
- `MarkdownRenderer` uses `dark:prose-invert` for document content
- Sidebar hardcoded to `bg-[#30364f]` — intentionally stays dark navy in both modes

---

## 7. Deleted

- `apps/` directory (experimental new Next.js frontend) — was causing crashes and has been removed entirely. All work lives in `acadex/`.
