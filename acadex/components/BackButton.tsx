'use client';

import { useRouter, usePathname } from 'next/navigation';


export default function BackButton() {
    const router = useRouter();
    const pathname = usePathname();

    // Don't show on home/landing or dashboard if we treat dashboard as root
    if (pathname === '/' || pathname === '/login') return null;

    return (
        <button
            onClick={() => router.back()}
            className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 opacity-25 rounded-full shadow-md border hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Go back"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
            </svg>
        </button>
    );
}
