"use client";

import { useState, useEffect } from "react";
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
    CheckCircle2
} from "lucide-react";

export default function CreateReminderPage() {
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [reminderTime, setReminderTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;
        if (!title || !reminderTime) {
            setError("Title and reminder time are required");
            return;
        }

        setLoading(true);
        setError(null);

        const { error: insertError } = await supabase.from("reminders").insert({
            title,
            description,
            reminder_time: reminderTime,
            user_id: user.id,
        });

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
        } else {
            router.push("/reminders");
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-muted font-medium animate-pulse">Setting things up...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="max-w-2xl mx-auto px-4 py-8 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="mb-12 space-y-4">
                <Link
                    href="/reminders"
                    className="inline-flex items-center gap-2 text-muted hover:text-primary font-bold text-sm transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Reminders</span>
                </Link>

                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary">
                        Set Reminder
                    </h1>
                    <p className="text-muted font-medium">
                        Create a reminder for your study sessions or important tasks.
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-card border border-muted/20 p-8 rounded-[2.5rem] shadow-2xl shadow-primary/5">
                <form onSubmit={handleSubmit} className="space-y-8">
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
                            placeholder="e.g. Study for Thermodynamics"
                            className="w-full bg-background/50 border border-muted/20 rounded-2xl p-5 font-bold text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none transition-all placeholder:text-muted/40"
                            required
                        />
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary/40 ml-1">
                            <FileText className="w-3 h-3" />
                            Additional Notes
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details, links, or specific topics to cover..."
                            rows={4}
                            className="w-full bg-background/50 border border-muted/20 rounded-2xl p-5 font-bold text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none transition-all placeholder:text-muted/40 resize-none"
                        />
                    </div>

                    {/* Time Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary/40 ml-1">
                            <Calendar className="w-3 h-3" />
                            Scheduled Time *
                        </label>
                        <div className="relative">
                            <input
                                type="datetime-local"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                                className="w-full bg-background/50 border border-muted/20 rounded-2xl p-5 font-bold text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none transition-all appearance-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl animate-in shake duration-500">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-red-500 text-sm font-bold">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-primary text-background rounded-2xl font-black text-lg shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin"></div>
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-6 h-6" />
                                    <span>Create Reminder</span>
                                </>
                            )}
                        </button>

                        <Link
                            href="/reminders"
                            className="px-8 py-5 bg-card border border-muted/20 text-primary rounded-2xl font-black text-lg hover:bg-muted/5 transition-all text-center"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>

            {/* Hint Section */}
            <div className="mt-8 flex items-center justify-center gap-2 text-muted/40 font-bold text-[10px] uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                Your reminders will appear in the dashboard and notify you when due.
            </div>
        </main>
    );
}
