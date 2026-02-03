"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getNote } from "@/app/notes/actions";
import NoteForm from "@/components/NoteForm";

export default function NoteEditPage() {
    const { id } = useParams();
    const noteId = parseInt(id as string);
    const [noteData, setNoteData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function loadNote() {
            // 1. Check session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }

            // 2. Fetch note using server action (RLS bypass)
            const res = await getNote(noteId);
            if (res.error || !res.note) {
                setError("Note not found or error loading data.");
                setLoading(false);
                return;
            }

            const note = res.note;

            // 3. Verify ownership
            if (note.author_id !== session.user.id) {
                setError("You are not authorized to edit this note.");
                setLoading(false);
                return;
            }

            setNoteData({
                title: note.title,
                content: note.content || "",
                course: note.course,
                topic: note.topic,
                visibility: note.visibility,
                group_id: note.group_id,
            });
            setLoading(false);
        }

        if (noteId) {
            loadNote();
        }
    }, [noteId, supabase, router]);

    if (loading) {
        return <div className="p-12 text-center text-lg">Loading note data...</div>;
    }

    if (error) {
        return (
            <div className="p-12 text-center text-red-600 font-bold">
                {error}
                <div className="mt-4">
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600 hover:underline"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-12">
            <NoteForm noteId={noteId} initialData={noteData} />
        </div>
    );
}
