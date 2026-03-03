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
    Timer,
    Network,
    Bell,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";
import FocusWidget from "./focus/FocusWidget";

const SIDEBAR_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Upload", href: "/notes/upload", icon: Upload },
    { name: "Groups", href: "/groups", icon: Users },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Reminders", href: "/reminder", icon: Bell },
    { name: "Focus", href: "/focus", icon: Timer },
    { name: "Nexus", href: "/nexus", icon: Network },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Do not wrap login page or landing page in the shell
    if (pathname === "/login" || pathname === "/") {
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
        fixed md:sticky top-0 left-0 z-50 h-[100dvh] bg-[#30364f] border-r border-white/10 shadow-subtle
        transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed ? "md:w-20" : "md:w-64"}
        w-64 flex flex-col
      `}>
                {/* Brand */}
                <div className={`w-full flex items-center justify-center border-b border-white/10 p-2 transition-all duration-300 ${isCollapsed ? "aspect-square" : "h-24"}`}>
                    <Link href="/dashboard" className="flex items-center w-full h-full overflow-hidden">
                        <img
                            src="/ACADEX.png"
                            alt="Acadex"
                            className={`transition-all duration-300 object-contain ${isCollapsed ? "scale-150 min-w-[80px]" : "w-full h-full"}`}
                        />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    {SIDEBAR_ITEMS.map((item) => {
                        let isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                        // Special case: prevent "Notes" highlighting when on "Upload" page
                        if (item.href === "/notes" && pathname === "/notes/upload") {
                            isActive = false;
                        }

                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-accent text-primary font-semibold"
                                    : "text-white/70 hover:bg-card/10 hover:text-white"
                                    } ${isCollapsed ? "justify-center px-2" : ""}`}
                                title={isCollapsed ? item.name : ""}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : "text-white/60"}`} />
                                <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse Toggle (Desktop Only) */}
                <div className="hidden md:flex p-4 border-t border-white/5">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-xl text-white/50 hover:bg-card/10 hover:text-white transition-all"
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                {/* User context or bottom links could go here */}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 min-h-screen pt-16 md:pt-0 overflow-x-hidden relative">
                <FocusWidget />
                <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
