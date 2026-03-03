"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Timer, Brain, Settings2, AlertCircle,
    Play, Pause, RotateCcw, ChevronRight,
    ArrowLeft, Maximize2, Minimize2, Plus, Minus, Undo2,
    Image as ImageIcon, Coffee, CloudRain, Waves, TreePine
} from "lucide-react";

type Tab = "zen" | "smart" | "custom";
type SmartMode = "focus" | "short" | "long";

interface Background {
    id: string;
    name: string;
    url: string;
    icon: React.ReactNode;
}

const BACKGROUNDS: Background[] = [
    {
        id: "forest",
        name: "Midnight Forest",
        url: "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=2070&auto=format&fit=crop",
        icon: <TreePine className="w-4 h-4" />
    },
    {
        id: "ocean",
        name: "Ocean Waves",
        url: "https://images.unsplash.com/photo-1505118380757-91f5f45d8de4?q=80&w=2000&auto=format&fit=crop",
        icon: <Waves className="w-4 h-4" />
    },
    {
        id: "cafe",
        name: "Cozy Cafe",
        url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop",
        icon: <Coffee className="w-4 h-4" />
    },
    {
        id: "rain",
        name: "Study Rain",
        url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1974&auto=format&fit=crop",
        icon: <CloudRain className="w-4 h-4" />
    }
];

export default function FocusPage() {
    const [activeTab, setActiveTab] = useState<Tab>("zen");
    const [isRunning, setIsRunning] = useState(false);
    const [remainingMs, setRemainingMs] = useState(25 * 60 * 1000);
    const [endAt, setEndAt] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeBg, setActiveBg] = useState<Background>(BACKGROUNDS[0]);

    // Zen Mode State
    const [zenDuration, setZenDuration] = useState(25);

    // Smart Focus State
    const [smartMode, setSmartMode] = useState<SmartMode>("focus");

    // Custom Mode State
    const [customMinutes, setCustomMinutes] = useState(40);

    // Global Distractions State (Session based)
    const [distractionCount, setDistractionCount] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Timer Engine
    useEffect(() => {
        if (isRunning && endAt) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const diff = endAt - now;
                if (diff <= 0) {
                    setRemainingMs(0);
                    setIsRunning(false);
                    setEndAt(null);
                    if (timerRef.current) clearInterval(timerRef.current);
                } else {
                    setRemainingMs(diff);
                }
            }, 250);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, endAt]);

    const startTimer = () => {
        setEndAt(Date.now() + remainingMs);
        setIsRunning(true);
    };

    const pauseTimer = () => {
        setIsRunning(false);
        setEndAt(null);
    };

    const resetTimer = (mins: number) => {
        setIsRunning(false);
        setEndAt(null);
        setRemainingMs(mins * 60 * 1000);
    };

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setIsRunning(false);
        setEndAt(null);

        if (tab === "zen") resetTimer(zenDuration);
        if (tab === "smart") {
            const mins = smartMode === "focus" ? 25 : smartMode === "short" ? 5 : 15;
            resetTimer(mins);
        }
        if (tab === "custom") resetTimer(customMinutes);
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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

    const handleSmartModeChange = (mode: SmartMode) => {
        setSmartMode(mode);
        const mins = mode === "focus" ? 25 : mode === "short" ? 5 : 15;
        resetTimer(mins);
    };

    return (
        <div className={`relative min-h-screen overflow-hidden transition-all duration-1000`}>
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
                    style={{ backgroundImage: `url(${activeBg.url})` }}
                />
                <div className={`absolute inset-0 transition-opacity duration-1000 ${isFullscreen ? 'bg-black/60' : 'bg-[#30364f]/40 backdrop-blur-[2px]'}`} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
            </div>

            <div className={`relative z-10 max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center px-6 py-12 transition-all duration-700 ${isFullscreen ? "max-w-none" : ""}`}>

                {/* Content Container */}
                <div className={`w-full transition-all duration-1000 transform ${isFullscreen ? 'scale-110' : ''}`}>

                    {/* Floating Back Button */}
                    {!isFullscreen && (
                        <div className="absolute top-0 left-0">
                            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all text-sm font-medium border border-white/10">
                                <ArrowLeft className="w-4 h-4" /> Exit
                            </Link>
                        </div>
                    )}

                    {/* Central Panel */}
                    <div className={`bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden transition-all duration-700 mx-auto ${isFullscreen ? "bg-transparent border-none shadow-none max-w-4xl" : "max-w-2xl"}`}>

                        {/* Tab Segmented Control */}
                        {!isFullscreen && (
                            <div className="flex p-2 bg-black/20 border-b border-white/5">
                                {[
                                    { id: "zen", icon: <Brain className="w-4 h-4" />, label: "Zen" },
                                    { id: "smart", icon: <Timer className="w-4 h-4" />, label: "Smart Focus" },
                                    { id: "custom", icon: <Settings2 className="w-4 h-4" />, label: "Custom" }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id as Tab)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
                                            ? "bg-white text-[#30364f] shadow-lg scale-[1.02]"
                                            : "text-white/40 hover:text-white hover:bg-white/5"}`}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className={`p-12 text-center`}>
                            {/* Main Timer Display */}
                            <div className="space-y-6">
                                <div className={`font-mono font-bold text-white tracking-tighter transition-all duration-1000 ${isFullscreen ? "text-[12rem]" : "text-9xl"}`}>
                                    {formatTime(remainingMs)}
                                </div>

                                {/* Mode Specific Controls (Duration Selectors) */}
                                {!isRunning && !isFullscreen && (
                                    <div className="pt-4 h-12 flex justify-center items-center">
                                        {activeTab === "zen" && (
                                            <div className="flex justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                                {[15, 30, 45, 60, 90].map((mins) => (
                                                    <button
                                                        key={mins}
                                                        onClick={() => { setZenDuration(mins); resetTimer(mins); }}
                                                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${zenDuration === mins
                                                            ? "bg-white text-[#30364f] border-white"
                                                            : "bg-transparent text-white/40 border-white/10 hover:border-white/30"}`}
                                                    >
                                                        {mins}m
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {activeTab === "smart" && (
                                            <div className="flex justify-center p-1 bg-black/20 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                                                {[
                                                    { id: "focus", label: "Focus" },
                                                    { id: "short", label: "Break" },
                                                    { id: "long", label: "Long" }
                                                ].map((mode) => (
                                                    <button
                                                        key={mode.id}
                                                        onClick={() => handleSmartModeChange(mode.id as SmartMode)}
                                                        className={`px-5 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-black transition-all ${smartMode === mode.id
                                                            ? "bg-white text-[#30364f]"
                                                            : "text-white/30 hover:text-white"}`}
                                                    >
                                                        {mode.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {activeTab === "custom" && (
                                            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                                                <button onClick={() => { const v = Math.max(1, customMinutes - 5); setCustomMinutes(v); resetTimer(v); }}
                                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 transition-all"><Minus className="w-4 h-4" /></button>
                                                <span className="text-xl font-bold text-white">{customMinutes}<span className="text-xs text-white/40 ml-1">min</span></span>
                                                <button onClick={() => { const v = Math.min(999, customMinutes + 5); setCustomMinutes(v); resetTimer(v); }}
                                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 transition-all"><Plus className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {isRunning && !isFullscreen && <div className="h-12" />} {/* Spacer when running to keep layout stable */}

                                {/* Main Action Buttons */}
                                <div className="flex items-center justify-center gap-6 pt-8">
                                    {!isRunning ? (
                                        <button
                                            onClick={startTimer}
                                            className="px-12 py-5 bg-white text-[#30364f] rounded-3xl font-black text-lg flex items-center gap-3 shadow-[0_15px_30px_rgba(255,255,255,0.15)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] active:translate-y-0"
                                        >
                                            <Play className="w-6 h-6 fill-current" /> Start Focus
                                        </button>
                                    ) : (
                                        <button
                                            onClick={pauseTimer}
                                            className="px-12 py-5 bg-amber-400 text-black rounded-3xl font-black text-lg flex items-center gap-3 shadow-[0_15px_30px_rgba(251,191,36,0.2)] transition-all hover:-translate-y-1 active:translate-y-0"
                                        >
                                            <Pause className="w-6 h-6 fill-current" /> Pause
                                        </button>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => resetTimer(activeTab === "zen" ? zenDuration : activeTab === "smart" ? (smartMode === "focus" ? 25 : smartMode === "short" ? 5 : 15) : customMinutes)}
                                            className="p-5 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-3xl text-white/60 hover:text-white transition-all border border-white/10"
                                            title="Reset"
                                        >
                                            <RotateCcw className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={toggleFullscreen}
                                            className="p-5 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-3xl text-white/60 hover:text-white transition-all border border-white/10"
                                            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                        >
                                            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Integrated Distraction Controls (Inside Main Panel) */}
                                <div className="pt-10 flex flex-col items-center gap-4 border-t border-white/5 mt-10">
                                    <div className="flex items-center gap-4 p-1.5 bg-black/30 rounded-full border border-white/10">
                                        <div className="px-4 text-xs font-black text-white/40 uppercase tracking-[0.2em]">Distractions</div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setDistractionCount(c => Math.max(0, c - 1))}
                                                className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
                                            >
                                                <Undo2 className="w-4 h-4" />
                                            </button>
                                            <div className="w-10 text-xl font-black text-white">{distractionCount}</div>
                                            <button
                                                onClick={() => setDistractionCount(c => c + 1)}
                                                className="p-3 bg-white text-[#30364f] hover:bg-slate-100 rounded-full transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Selector (Bottom Center) */}
                    {!isFullscreen && (
                        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-black/30 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                            {BACKGROUNDS.map((bg) => (
                                <button
                                    key={bg.id}
                                    onClick={() => setActiveBg(bg)}
                                    className={`relative flex items-center gap-3 px-5 py-3 rounded-[1.5rem] transition-all duration-500 overflow-hidden group ${activeBg.id === bg.id
                                        ? "bg-white text-[#30364f]"
                                        : "text-white/40 hover:text-white hover:bg-white/5"}`}
                                >
                                    {bg.icon}
                                    <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 ${activeBg.id === bg.id ? "max-w-xs opacity-100 mr-1" : "max-w-0 opacity-0 overflow-hidden"}`}>
                                        {bg.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Widget (Top Right) - Activates when running */}
            {isRunning && !isFullscreen && (
                <div className="fixed top-8 right-8 z-50 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="bg-[#30364f] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-3 w-40 overflow-hidden group">
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Focusing
                        </div>
                        <div className="text-4xl font-black text-white tracking-tight tabular-nums">
                            {formatTime(remainingMs)}
                        </div>
                        <div className="w-full h-px bg-white/5" />
                        <div className="flex items-center justify-between w-full px-1">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">Distractions</span>
                            <span className="text-sm font-black text-white">{distractionCount}</span>
                        </div>
                        <button
                            onClick={() => setDistractionCount(c => c + 1)}
                            className="w-full py-2.5 bg-white/10 hover:bg-white text-white hover:text-[#30364f] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Report Distraction
                        </button>
                    </div>
                </div>
            )}

            {/* Global Style overrides */}
            <style jsx global>{`
                ::selection {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }
            `}</style>
        </div>
    );
}
