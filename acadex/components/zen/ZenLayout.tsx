"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import PomodoroTimer from "./PomodoroTimer";
import QuickJot from "./QuickJot";
import BackgroundSelector, { BackgroundOption } from "./BackgroundSelector";

const DEFAULT_BG: BackgroundOption = {
    id: "forest",
    name: "Midnight Forest",
    type: "image",
    url: "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=2070&auto=format&fit=crop",
    thumbnail: "bg-emerald-900",
};

export default function ZenLayout() {
    const [background, setBackground] = useState<BackgroundOption>(DEFAULT_BG);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    return (
        <main className="relative w-full h-screen overflow-hidden bg-black transition-all duration-1000">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                {background.type === "video" ? (
                    <video
                        src={background.url}
                        autoPlay
                        loop
                        muted
                        className="w-full h-full object-cover opacity-60 transition-opacity duration-1000"
                    />
                ) : (
                    <div
                        className="w-full h-full bg-cover bg-center opacity-60 transition-all duration-1000 transform scale-105"
                        style={{ backgroundImage: `url(${background.url})` }}
                    />
                )}
                {/* Cinematic Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            </div>

            {/* Top Bar Navigation (Minimal) */}
            <div className="absolute top-8 left-8 z-50 flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="group flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/50 backdrop-blur-sm border border-white/5 rounded-full text-white/70 hover:text-white transition-all"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Exit Zen Mode</span>
                </Link>
                <button
                    onClick={toggleFullscreen}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                    title="Toggle Fullscreen"
                >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
            </div>

            {/* Widgets */}
            <BackgroundSelector currentBg={background.id} onSelect={setBackground} />
            <PomodoroTimer />
            <QuickJot />

            {/* Center Motivational Quote */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/30 text-xs tracking-[0.2em] font-light uppercase select-none pointer-events-none z-10">
                Focus on now
            </div>
        </main>
    );
}
