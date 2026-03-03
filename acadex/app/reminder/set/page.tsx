"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import {
  Clock,
  Bell,
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";

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

  // 🔐 Auth check
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

    const dateObj = new Date(remindAt);
    const isoString = dateObj.toISOString();

    const { error: insertError } = await supabase.from("reminders").insert({
      creator_id: user.id,
      title,
      description,
      remind_at: isoString,
      priority,
      is_public: true, // Community sharing by default for this feature
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      router.push("/reminder");
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted font-medium animate-pulse">Establishing Connection...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="mb-12 space-y-4 text-center">
        <Link
          href="/reminder"
          className="inline-flex items-center gap-2 text-muted hover:text-primary font-bold text-sm transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Community Board</span>
        </Link>

        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary">
            Set Reminder
          </h1>
          <p className="text-muted font-medium">
            Share a deadline or study goal with the entire community.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-card border border-muted/20 p-8 rounded-[2.5rem] shadow-2xl shadow-primary/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); saveReminder(); }}>
          {/* Title Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary/40 ml-1">
              <Bell className="w-3 h-3" />
              Reminder Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Physics (Chapter 4-6)"
              className="w-full bg-background/50 border border-muted/20 rounded-2xl p-5 font-bold text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none transition-all placeholder:text-muted/40"
              required
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary/40 ml-1">
              <FileText className="w-3 h-3" />
              Short Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add brief details for your classmates..."
              rows={3}
              className="w-full bg-background/50 border border-muted/20 rounded-2xl p-5 font-bold text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none transition-all placeholder:text-muted/40 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary/40 ml-1">
                <Calendar className="w-3 h-3" />
                Deadline *
              </label>
              <input
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                className="w-full bg-background/50 border border-muted/20 rounded-2xl p-5 font-bold text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none transition-all"
                required
              />
            </div>

            {/* Priority Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary/40 ml-1">
                <ShieldCheck className="w-3 h-3" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                className="w-full bg-background/50 border border-muted/20 rounded-2xl p-5 font-bold text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl animate-in shake">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-500 text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={saveReminder}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-primary text-background rounded-2xl font-black text-lg shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin"></div>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Post Reminder</span>
                </>
              )}
            </button>

            <Link
              href="/reminder"
              className="px-8 py-5 bg-card border border-muted/20 text-primary rounded-2xl font-black text-lg hover:bg-muted/5 transition-all text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Hint Section */}
      <div className="mt-8 flex items-center justify-center gap-2 text-muted/30 font-bold text-[10px] uppercase tracking-widest text-center max-w-sm mx-auto">
        <CheckCircle2 className="w-3 h-3 shrink-0" />
        Community reminders are visible to all users to encourage collective focus.
      </div>
    </main>
  );
}
