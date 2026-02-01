'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { updateProfile, getProfile } from './actions';

export default function SettingsPage() {
    const [user, setUser] = useState<{ id: string; email?: string; username: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check authentication
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Fetch profile using server action (bypasses RLS)
            const profile = await getProfile(user.id);

            setUser({
                id: user.id,
                email: user.email,
                username: profile?.username || 'User'
            });
            setLoading(false);
        };

        getUser();

        // Check dark mode preference
        const isDark = localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setDarkMode(isDark);
    }, [router, supabase]);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return <div className="p-12 text-center text-lg">Loading Settings...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-10 transition-colors duration-300">
            <div className="max-w-2xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center mb-8">
                    <Link href="/dashboard" className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5m7-7-7 7 7 7" />
                        </svg>
                    </Link>
                    <h1 className="text-3xl font-bold">Settings</h1>
                </div>

                {/* Profile Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 border-b dark:border-gray-700 pb-2">Profile</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400">Username</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={user?.username || ''}
                                    onChange={(e) => setUser(prev => prev ? { ...prev, username: e.target.value } : null)}
                                    className="font-medium text-lg bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none w-full"
                                />
                                <button
                                    onClick={async () => {
                                        if (!user?.username) return;

                                        const { success, error } = await updateProfile(user.id, user.username);

                                        if (!success) {
                                            alert('Error updating username: ' + error);
                                        } else {
                                            alert('Username updated successfully!');
                                            // Force reload to update global state/warnings if needed
                                            window.location.reload();
                                        }
                                    }}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400">Email</label>
                            <p className="font-medium text-lg">{user?.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400">User ID</label>
                            <p className="font-mono text-xs text-gray-400">{user?.id}</p>
                        </div>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 border-b dark:border-gray-700 pb-2">Appearance</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`w-14 h-8 flex items-center rounded-full p-1 duration-300 ease-in-out ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${darkMode ? 'translate-x-6' : ''}`}></div>
                        </button>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 border-b dark:border-gray-700 pb-2">Account</h2>
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition text-center"
                    >
                        Log Out
                    </button>
                </div>

            </div>
        </div>
    );
}
