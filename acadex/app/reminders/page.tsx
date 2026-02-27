"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

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

            // Fetch reminders
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
        return <div className="p-12 text-center text-lg">Loading Reminders...</div>;
    }

    const upcomingReminders = reminders.filter((r) => !r.is_completed);
    const completedReminders = reminders.filter((r) => r.is_completed);

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-4xl font-bold text-gray-900">🔔 My Reminders</h1>
                    <div className="flex gap-3">
                        <Link
                            href="/reminders/create"
                            className="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition"
                        >
                            ➕ New Reminder
                        </Link>
                        <Link
                            href="/dashboard"
                            className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Upcoming Reminders */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Upcoming ({upcomingReminders.length})
                    </h2>
                    {upcomingReminders.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingReminders.map((reminder) => (
                                <div
                                    key={reminder.id}
                                    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {reminder.title}
                                            </h3>
                                            {reminder.description && (
                                                <p className="text-gray-600 mt-1">{reminder.description}</p>
                                            )}
                                            <p className="text-sm text-blue-600 mt-2">
                                                📅 {new Date(reminder.reminder_time).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleComplete(reminder.id, reminder.is_completed)}
                                                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                            >
                                                ✓ Complete
                                            </button>
                                            <button
                                                onClick={() => deleteReminder(reminder.id)}
                                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                            No upcoming reminders. Create one to get started!
                        </div>
                    )}
                </div>

                {/* Completed Reminders */}
                {completedReminders.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Completed ({completedReminders.length})
                        </h2>
                        <div className="space-y-3">
                            {completedReminders.map((reminder) => (
                                <div
                                    key={reminder.id}
                                    className="bg-gray-100 p-4 rounded-lg shadow opacity-75"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-700 line-through">
                                                {reminder.title}
                                            </h3>
                                            {reminder.description && (
                                                <p className="text-gray-500 mt-1">{reminder.description}</p>
                                            )}
                                            <p className="text-sm text-gray-500 mt-2">
                                                📅 {new Date(reminder.reminder_time).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleComplete(reminder.id, reminder.is_completed)}
                                                className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                                            >
                                                ↺ Undo
                                            </button>
                                            <button
                                                onClick={() => deleteReminder(reminder.id)}
                                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
