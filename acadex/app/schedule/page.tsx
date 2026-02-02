"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function SchedulePage() {
    const [user, setUser] = useState<{ id: string; username: string } | null>(null);
    const [loading, setLoading] = useState(true);
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

            const { data: profile } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", user.id)
                .single();

            setUser({ id: user.id, username: profile?.username || "User" });
            setLoading(false);
        }

        checkAuth();
    }, [router, supabase]);

    if (loading) {
        return <div className="p-12 text-center text-lg">Loading Schedule...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-4xl font-bold text-gray-900">
                        🗓️ My Schedule
                    </h1>
                    <Link
                        href="/dashboard"
                        className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                {/* Welcome Message */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Welcome, {user.username}!
                    </h2>
                    <p className="text-gray-600">
                        Organize your study schedule and manage your time effectively.
                    </p>
                </div>

                {/* Weekly Schedule Grid */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Weekly Schedule
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-3 text-left font-semibold">Time</th>
                                    <th className="border p-3 text-left font-semibold">Monday</th>
                                    <th className="border p-3 text-left font-semibold">Tuesday</th>
                                    <th className="border p-3 text-left font-semibold">Wednesday</th>
                                    <th className="border p-3 text-left font-semibold">Thursday</th>
                                    <th className="border p-3 text-left font-semibold">Friday</th>
                                    <th className="border p-3 text-left font-semibold">Saturday</th>
                                    <th className="border p-3 text-left font-semibold">Sunday</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    "8:00 AM",
                                    "9:00 AM",
                                    "10:00 AM",
                                    "11:00 AM",
                                    "12:00 PM",
                                    "1:00 PM",
                                    "2:00 PM",
                                    "3:00 PM",
                                    "4:00 PM",
                                    "5:00 PM",
                                ].map((time) => (
                                    <tr key={time} className="hover:bg-gray-50">
                                        <td className="border p-3 font-medium text-gray-700">
                                            {time}
                                        </td>
                                        {[...Array(7)].map((_, i) => (
                                            <td
                                                key={i}
                                                className="border p-3 text-sm text-gray-500 cursor-pointer hover:bg-blue-50"
                                            >
                                                {/* Empty cell - can be clicked to add events */}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                        📝 Coming Soon
                    </h3>
                    <p className="text-sm text-blue-800">
                        This is a basic schedule view. Future updates will include:
                    </p>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
                        <li>• Add and edit schedule events</li>
                        <li>• Set reminders for classes and study sessions</li>
                        <li>• Sync with your course schedule</li>
                        <li>• Color-coded events by subject</li>
                        <li>• Export to calendar apps</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
