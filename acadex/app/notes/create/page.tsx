// app/notes/create/page.tsx
import NoteForm from "@/components/NoteForm";

// This is a Server Component, it just renders the client-side form
export default function CreateNotePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <NoteForm />
    </div>
  );
}
