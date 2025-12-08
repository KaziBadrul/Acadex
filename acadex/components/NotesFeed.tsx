"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase"; // Assuming this is where your generated types live

// Define the Note type using the generated Database schema
type Note = Database["public"]["Tables"]["notes"]["Row"];

export default function NotesFeed() {
  // State is now strongly typed as an array of Note objects
  const [notes, setNotes] = useState<Note[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchNotes = async () => {
      // The `.from("notes")` call is now checked against your DB schema
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching notes:", error);
      else setNotes(data || []);
    };

    fetchNotes();
  }, []);

  return (
    <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recent Academic Notes</h2>     {" "}
      {notes.map((note) => (
        <div key={note.id} className="p-4 border rounded shadow-sm">
                    <h3 className="font-semibold text-lg">{note.title}</h3>     
              <p className="text-sm text-gray-500">{note.course}</p>         {" "}
          {/* Truncate content for preview */}         {" "}
          <p className="mt-2 text-gray-700">
                        {note.content.substring(0, 100)}...          {" "}
          </p>
                 {" "}
        </div>
      ))}
         {" "}
    </div>
  );
}
