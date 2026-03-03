"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import {
    Bell,
    Plus,
    Trash2,
    CheckCircle2,
    Undo2,
    Calendar,
    Clock,
    LayoutDashboard,
    AlertCircle,
    ChevronRight
} from "lucide-react";

interface Reminder {
    id: number;
    title: string;
    description: string;
    reminder_time: string;
    is_completed: boolean;
    note_id: number | null;
}

export default function RemindersPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: string } | null>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            setUser({ id: user.id });

            const { data: remindersData } = await supabase
                .from("reminders")
                .select("*")
                .eq("user_id", user.id)
                .order("reminder_time", { ascending: true });

            if (remindersData) {
                setReminders(remindersData);
            }

            setLoading(false);
        }

        fetchData();
    }, [router, supabase]);

    const toggleComplete = async (id: number, currentStatus: boolean) => {
        const { error } = await supabase
            .from("reminders")
            .update({ is_completed: !currentStatus })
            .eq("id", id);

        if (!error) {
            setReminders(
                reminders.map((r) =>
                    r.id === id ? { ...r, is_completed: !currentStatus } : r
                )
            );
        }
    };

    const deleteReminder = async (id: number) => {
        if (!confirm("Are you sure you want to delete this reminder?")) return;

        const { error } = await supabase.from("reminders").delete().eq("id", id);

        if (!error) {
            setReminders(reminders.filter((r) => r.id !== id));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-muted font-medium animate-pulse">Loading Reminders...</p>
                </div>
            </div>
        );
    }

    const upcomingReminders = reminders.filter((r) => !r.is_completed);
    const completedReminders = reminders.filter((r) => r.is_completed);

    return (
        <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12 border-b border-muted/10 pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-primary mb-1">
                        <div className="p-2 bg-primary/5 rounded-xl">
                            <Bell className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest opacity-60">Personal Assistant</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary">
                        Reminders
                    </h1>
                    <p className="text-muted font-medium max-w-md">
                        Manage your study schedule and stay on top of your deadlines with ease.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/reminders/create"
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-background rounded-2xl font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="w-5 h-5" /> New Reminder
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-6 py-3 bg-card border border-muted/20 text-primary rounded-2xl font-bold hover:bg-muted/5 transition-all"
                    >
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Upcoming Section */}
                <section className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-primary flex items-center gap-2">
                            Upcoming <span className="px-2 py-0.5 bg-primary/5 text-primary/60 text-sm rounded-lg">{upcomingReminders.length}</span>
                        </h2>
                    </div>

                    {upcomingReminders.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {upcomingReminders.map((reminder) => (
                                <div
                                    key={reminder.id}
                                    className="group bg-card border border-muted/20 p-6 rounded-[2rem] hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(reminder.reminder_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                                <span className="opacity-20">•</span>
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(reminder.reminder_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>

                                            <h3 className="text-xl font-bold text-primary group-hover:text-primary/90 transition-colors">
                                                {reminder.title}
                                            </h3>

                                            {reminder.description && (
                                                <p className="text-muted text-sm line-clamp-2 leading-relaxed italic border-l-2 border-primary/10 pl-4 py-1">
                                                    {reminder.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => toggleComplete(reminder.id, reminder.is_completed)}
                                                className="flex items-center justify-center gap-2 p-3 bg-primary/5 hover:bg-primary text-primary hover:text-background rounded-2xl transition-all group/btn"
                                                title="Mark as complete"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                                <span className="sm:hidden lg:inline text-xs font-bold uppercase tracking-wider pr-1">Done</span>
                                            </button>
                                            <button
                                                onClick={() => deleteReminder(reminder.id)}
                                                className="flex items-center justify-center gap-2 p-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all"
                                                title="Delete reminder"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card/50 border-2 border-dashed border-muted/20 rounded-[2.5rem] p-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/30">
                                <Bell className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-primary font-bold">Clear skies ahead!</p>
                                <p className="text-muted text-sm">You don't have any upcoming reminders at the moment.</p>
                            </div>
                            <Link href="/reminders/create" className="inline-flex items-center gap-2 text-primary text-sm font-bold hover:gap-3 transition-all">
                                Create one now <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </section>

                {/* Completed Section */}
                <aside className="lg:col-span-4 space-y-6">
                    <h2 className="text-xl font-black text-primary flex items-center gap-2">
                        History <span className="px-2 py-0.5 bg-primary/5 text-primary/60 text-sm rounded-lg">{completedReminders.length}</span>
                    </h2>

                    {completedReminders.length > 0 ? (
                        <div className="space-y-4">
                            {completedReminders.map((reminder) => (
                                <div
                                    key={reminder.id}
                                    className="bg-card/40 border border-muted/10 p-5 rounded-[1.5rem] opacity-60 hover:opacity-100 transition-all duration-300 group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-primary line-through decoration-primary/30">
                                                {reminder.title}
                                            </h3>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => toggleComplete(reminder.id, reminder.is_completed)}
                                                    className="p-1.5 hover:bg-primary/10 rounded-lg text-primary/40 hover:text-primary transition-all"
                                                    title="Undo"
                                                >
                                                    <Undo2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteReminder(reminder.id)}
                                                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500/40 hover:text-red-500 transition-all"
                                                    title="Delete permanently"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-wider">
                                            <span>Completed</span>
                                            <span className="opacity-30">•</span>
                                            <span>{new Date(reminder.reminder_time).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card/20 border border-muted/10 rounded-3xl p-8 text-center">
                            <p className="text-muted text-xs font-bold uppercase tracking-widest">No history yet</p>
                        </div>
                    )}
                </aside>
            </div>
        </main>
    );
}
