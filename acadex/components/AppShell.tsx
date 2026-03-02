"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Upload,
    Users,
    Calendar,
    Settings,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

const SIDEBAR_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Upload", href: "/notes/upload", icon: Upload },
    { name: "Groups", href: "/groups", icon: Users },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Do not wrap login page in the shell
    if (pathname === "/login") {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Mobile Header & Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#30364f] border-b border-white/10 z-30 flex items-center justify-between px-4 shadow-sm">
                <Link href="/dashboard" className="flex items-center">
                    <img src="/ACADEX.png" alt="Acadex" className="h-10 w-auto max-w-[140px] object-contain" />
                </Link>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 -mr-2 text-white hover:bg-card/10 rounded-lg transition-colors">
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-[#30364f]/20 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-[100dvh] w-64 bg-[#30364f] border-r border-white/10 shadow-subtle
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        flex flex-col
      `}>
                {/* Brand */}
                <div className="w-full aspect-square flex items-center justify-center border-b border-white/10 p-2">
                    <Link href="/dashboard" className="flex items-center w-full h-full">
                        <img src="/ACADEX.png" alt="Acadex" className="w-full h-full object-contain" />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-accent text-primary font-semibold"
                                    : "text-white/70 hover:bg-card/10 hover:text-white"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-white/60"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User context or bottom links could go here */}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 min-h-screen pt-16 md:pt-0 overflow-x-hidden">
                <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
