'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { updateProfile, getProfile } from './actions';
import { Settings, User, Moon, LogOut, Loader2, Save, Mail, Fingerprint } from 'lucide-react';

export default function SettingsPage() {
    const [user, setUser] = useState<{ id: string; email?: string; username: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        return (
            <div className="w-full pb-10 flex justify-center items-center min-h-[50vh]">
                <div className="flex flex-col items-center text-primary/40 gap-4 animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="font-medium">Loading preferences...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full pb-10">
            <div className="flex items-center gap-3 mb-8 border-b border-muted/20 pb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/70">
                    <Settings className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">
                        Settings
                    </h1>
                    <p className="text-primary/60 text-sm mt-1">
                        Manage your account preferences and application settings.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl space-y-8">
                {/* Profile Section */}
                <div className="bg-card rounded-2xl shadow-subtle border border-muted/20 overflow-hidden">
                    <div className="px-6 py-5 border-b border-muted/10 bg-muted/5 flex items-center gap-2 text-primary font-bold">
                        <User className="w-5 h-5 text-accent" />
                        <h2>Profile Information</h2>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-primary/60 uppercase tracking-wider mb-2">Display Name</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={user?.username || ''}
                                        onChange={(e) => setUser(prev => prev ? { ...prev, username: e.target.value } : null)}
                                        className="flex-1 border border-muted/40 bg-background/50 rounded-xl px-4 py-2.5 text-primary placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all font-medium"
                                        placeholder="Enter display name"
                                    />
                                    <button
                                        onClick={async () => {
                                            if (!user?.username) return;
                                            setSaving(true);
                                            const { success, error } = await updateProfile(user.id, user.username);
                                            setSaving(false);

                                            if (!success) {
                                                alert('Error updating username: ' + error);
                                            } else {
                                                alert('Username updated successfully!');
                                                window.location.reload();
                                            }
                                        }}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6 pt-4">
                                <div className="bg-background/50 border border-muted/10 rounded-xl p-4 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary/50 shrink-0">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <label className="block text-[11px] font-bold text-primary/40 uppercase tracking-wider mb-0.5">Email Address</label>
                                        <p className="font-medium text-primary/80 truncate">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="bg-background/50 border border-muted/10 rounded-xl p-4 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary/50 shrink-0">
                                        <Fingerprint className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <label className="block text-[11px] font-bold text-primary/40 uppercase tracking-wider mb-0.5">Account ID</label>
                                        <p className="font-mono text-xs text-primary/60 truncate mt-1">{user?.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="bg-card rounded-2xl shadow-subtle border border-muted/20 overflow-hidden divide-y divide-muted/10">
                    <div className="px-6 py-5 bg-muted/5 flex items-center gap-2 text-primary font-bold">
                        <Moon className="w-5 h-5 text-accent" />
                        <h2>Appearance & Preferences</h2>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-primary text-[15px]">Dark Mode</p>
                                <p className="text-sm text-primary/50 mt-0.5">Toggle a darker, high-contrast theme</p>
                            </div>
                            <button
                                onClick={toggleDarkMode}
                                className={`relative w-14 h-8 flex items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${darkMode ? 'bg-primary' : 'bg-muted/30'}`}
                            >
                                <span className="sr-only">Toggle dark mode</span>
                                <div className={`bg-card w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out flex items-center justify-center ${darkMode ? 'translate-x-7' : 'translate-x-1'}`}>
                                    {darkMode && <Moon className="w-3.5 h-3.5 text-primary" />}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Session Management */}
                <div className="bg-card rounded-2xl shadow-subtle border border-muted/20 overflow-hidden divide-y divide-muted/10">
                    <div className="px-6 py-5 bg-muted/5 flex items-center gap-2 text-primary font-bold">
                        <LogOut className="w-5 h-5 text-primary/40" />
                        <h2>Session Management</h2>
                    </div>

                    <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-primary text-[15px]">Account Session</p>
                            <p className="text-sm text-primary/50 mt-0.5">Sign out of your active session on this device.</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full sm:w-auto px-8 py-2.5 bg-background border border-muted/30 text-primary font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm hover:shadow-md"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


