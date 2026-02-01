'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';

export default function UsernameWarning() {
    const [showWarning, setShowWarning] = useState(false);
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        // Don't show on login or if already on settings page
        if (pathname === '/login' || pathname === '/settings') {
            setShowWarning(false);
            return;
        }

        const checkUsername = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .single();

            // Show warning if username is missing or default "User" (assuming "User" is placeholder/null)
            if (!profile?.username || profile.username === 'User') {
                setShowWarning(true);
            } else {
                setShowWarning(false);
            }
        };

        checkUsername();
    }, [pathname, supabase]);

    if (!showWarning) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[60] bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded shadow-lg max-w-sm animate-pulse">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold">Set your username</p>
                    <p className="text-sm">Please set a unique username to continue.</p>
                </div>
                <Link
                    href="/settings"
                    className="ml-4 px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded hover:bg-orange-600 transition"
                >
                    Set Now
                </Link>
            </div>
        </div>
    );
}
