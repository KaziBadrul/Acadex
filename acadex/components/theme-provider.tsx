'use client';

import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const theme = localStorage.getItem('theme');
        const isDark = theme === 'dark' ||
            (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Prevent hydration mismatch by rendering nothing until mounted
    if (!mounted) {
        return <>{children}</>;
    }

    return <>{children}</>;
}
