"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Reminder = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  remind_at: string; // timestamptz
  priority: "low" | "medium" | "high";
  is_public: boolean;
  created_at: string;
};

function priorityBadge(priority: Reminder["priority"]) {
  const base = "text-xs font-semibold px-2 py-1 rounded-full";
  if (priority === "high") return `${base} bg-red-100 text-red-700`;
  if (priority === "low") return `${base} bg-gray-100 text-gray-700`;
  return `${base} bg-yellow-100 text-yellow-800`;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadReminders() {
    setError(null);
    setLoading(true);

    const { data, error } = await supabase
      .from("reminders")
      .select(
        "id, creator_id, title, description, remind_at, priority, is_public, created_at"
      )
      .eq("is_public", true)
      .order("remind_at", { ascending: true });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setReminders((data ?? []) as Reminder[]);
  }

  useEffect(() => {
    loadReminders();
  }, []);

  // Optional grouping: Today / Upcoming
  const grouped = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const today: Reminder[] = [];
    const upcoming: Reminder[] = [];

    for (const r of reminders) {
      const t = new Date(r.remind_at);
      if (t >= startOfToday && t < startOfTomorrow) today.push(r);
      else upcoming.push(r);
    }

    return { today, upcoming };
  }, [reminders]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Community Reminders</h1>

          <button
            onClick={loadReminders}
            className="text-sm px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl shadow p-4 text-sm text-gray-600">
            Loading reminders…
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl shadow p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && reminders.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-4 text-sm text-gray-600">
            No public reminders yet.
          </div>
        )}

        {!loading && !error && reminders.length > 0 && (
          <div className="space-y-6">
            {/* TODAY */}
            {grouped.today.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  Today
                </h2>
                <div className="space-y-3">
                  {grouped.today.map((r) => (
                    <ReminderCard key={r.id} r={r} />
                  ))}
                </div>
              </section>
            )}

            {/* UPCOMING */}
            {grouped.upcoming.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  Upcoming
                </h2>
                <div className="space-y-3">
                  {grouped.upcoming.map((r) => (
                    <ReminderCard key={r.id} r={r} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function ReminderCard({ r }: { r: Reminder }) {
  const badge = priorityBadge(r.priority);
  const when = new Date(r.remind_at).toLocaleString();

  return (
    <div className="bg-white rounded-2xl shadow p-4 flex gap-3 justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold truncate">{r.title}</p>
          <span className={badge}>{r.priority}</span>
        </div>

        {r.description && (
          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
            {r.description}
          </p>
        )}

        <p className="text-xs text-gray-500 mt-2">{when}</p>
      </div>
    </div>
  );
}
