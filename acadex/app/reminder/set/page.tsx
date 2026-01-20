"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SetReminderPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔐 Auth check (same as Upload page)
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser({ id: user.id });
    }

    checkAuth();
  }, [router, supabase]);

  async function saveReminder() {
    if (!user) return;

    if (!title || !remindAt) {
      setError("Title and reminder time are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from("reminders").insert({
      creator_id: user.id,
      title,
      description,
      remind_at: remindAt,
      priority,
      is_public: true,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      setTitle("");
      setDescription("");
      setRemindAt("");
      setPriority("medium");
      alert("Reminder saved!");
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Checking authentication…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold text-black mb-4">New Reminder</h1>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        <input
          className="w-full p-2 border rounded-lg mb-3 text-gray-900"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-2 border rounded-lg mb-3 text-gray-900"
          placeholder="Notes (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full p-2 border rounded-lg mb-3 text-gray-900"
          value={remindAt}
          onChange={(e) => setRemindAt(e.target.value)}
        />

        <select
          className="w-full p-2 border rounded-lg mb-4 text-gray-900 bg-white"
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as "low" | "medium" | "high")
          }
        >
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>

        <button
          onClick={saveReminder}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save Reminder"}
        </button>
      </div>
    </main>
  );
}
