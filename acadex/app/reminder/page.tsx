"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useReminderNotifications } from "@/components/ReminderNotificationProvider";
import Link from "next/link";
import {
  Bell,
  Plus,
  RefreshCcw,
  Calendar,
  Clock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";

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

function PriorityBadge({ priority }: { priority: Reminder["priority"] }) {
  const configs = {
    high: "bg-red-500/10 text-red-500 border-red-500/20",
    medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    low: "bg-green-500/10 text-green-500 border-green-500/20"
  };

  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${configs[priority]}`}>
      {priority}
    </span>
  );
}

export default function RemindersPage() {
  const { checkReminders } = useReminderNotifications();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadReminders() {
    setError(null);
    setLoading(true);

    const { data, error } = await supabase
      .from("reminders")
      .select("id, creator_id, title, description, remind_at, priority, is_public, created_at")
      .eq("is_public", true)
      .order("remind_at", { ascending: true });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setReminders((data ?? []) as Reminder[]);
    checkReminders();
  }

  useEffect(() => {
    loadReminders();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted font-medium animate-pulse">Syncing Community Reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12 border-b border-muted/10 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary mb-1">
            <div className="p-2 bg-primary/5 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest opacity-60">Community Pulse</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary">
            Reminders
          </h1>
          <p className="text-muted font-medium max-w-md">
            Stay in the loop with shared academic deadlines and community events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/reminder/set"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-background rounded-2xl font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-5 h-5" /> Set Reminder
          </Link>
          <button
            onClick={loadReminders}
            className="flex items-center gap-2 px-6 py-3 bg-card border border-muted/20 text-primary rounded-2xl font-bold hover:bg-muted/5 transition-all"
          >
            <RefreshCcw className="w-5 h-5" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-[2rem] flex items-center gap-4 mb-8">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-red-500 font-bold">{error}</p>
        </div>
      )}

      {reminders.length === 0 ? (
        <div className="bg-card/50 border-2 border-dashed border-muted/20 rounded-[2.5rem] p-16 text-center space-y-4">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/30">
            <Bell className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-primary">Quiet for now...</h3>
            <p className="text-muted text-sm max-w-xs mx-auto">No shared reminders have been posted yet. Be the first to share a deadline!</p>
          </div>
          <Link href="/reminder/set" className="inline-flex items-center gap-2 text-primary text-sm font-bold hover:gap-3 transition-all pt-4">
            Create a Community Reminder <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Main Content Areas */}
          <div className="md:col-span-8 space-y-12">
            {/* TODAY SECTION */}
            {grouped.today.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-black text-primary flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent" /> Due Today
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {grouped.today.map((r) => (
                    <ReminderCard key={r.id} r={r} />
                  ))}
                </div>
              </section>
            )}

            {/* UPCOMING SECTION */}
            {grouped.upcoming.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-black text-primary flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-accent" /> Upcoming
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {grouped.upcoming.map((r) => (
                    <ReminderCard key={r.id} r={r} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Area */}
          <aside className="md:col-span-4 lg:col-span-4 space-y-8">
            <div className="bg-primary text-background p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 space-y-4">
              <h3 className="text-xl font-black">Stay Productive</h3>
              <p className="text-sm opacity-80 leading-relaxed font-medium">
                Keep your goals in sight. Reminders help you and your classmates stay synchronized with important academic milestones.
              </p>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full py-4 bg-background text-primary rounded-2xl font-black hover:opacity-90 transition-all"
              >
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

function ReminderCard({ r }: { r: Reminder }) {
  const when = new Date(r.remind_at);
  const time = when.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const date = when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div className="group bg-card border border-muted/20 p-6 rounded-[2rem] hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <PriorityBadge priority={r.priority} />
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40">
                <Clock className="w-3 h-3" /> {time}
                <span className="opacity-20">•</span>
                <Calendar className="w-3 h-3" /> {date}
              </div>
            </div>
            <h3 className="text-xl font-bold text-primary group-hover:text-primary/90 transition-colors">
              {r.title}
            </h3>
          </div>
        </div>

        {r.description && (
          <p className="text-muted text-sm leading-relaxed border-l-2 border-primary/10 pl-4 py-1 italic">
            {r.description}
          </p>
        )}
      </div>

      {/* Decorative active indicator */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors`} />
    </div>
  );
}
