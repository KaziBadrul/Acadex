"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming utility for tailwind class merging exists, compliant with shadcn

type TimerMode = "focus" | "shortBreak" | "longBreak";

const TIMER_CONFIG = {
    focus: { label: "Focus", minutes: 25, color: "text-rose-500" },
    shortBreak: { label: "Short Break", minutes: 5, color: "text-teal-500" },
    longBreak: { label: "Long Break", minutes: 15, color: "text-blue-500" },
};

export default function PomodoroTimer() {
    const [mode, setMode] = useState<TimerMode>("focus");
    const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG.focus.minutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode);
        setTimeLeft(TIMER_CONFIG[newMode].minutes * 60);
        setIsActive(false);
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(TIMER_CONFIG[mode].minutes * 60);
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Optional: Play sound here
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progress =
        100 - (timeLeft / (TIMER_CONFIG[mode].minutes * 60)) * 100;

    return (
        <div
            className={cn(
                "fixed bottom-8 right-8 z-50 transition-all duration-300 ease-in-out",
                isMinimized ? "w-16 h-16 rounded-full overflow-hidden" : "w-80 rounded-2xl"
            )}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden text-white">
                {isMinimized ? (
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="w-full h-full flex items-center justify-center hover:bg-white/10"
                    >
                        <div
                            className="absolute bottom-0 left-0 h-full bg-white/20 transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                        <span className="relative font-bold text-xs">{formatTime(timeLeft)}</span>
                    </button>
                ) : (
                    <div className="p-6 flex flex-col items-center gap-4">
                        {/* Header */}
                        <div className="flex justify-between w-full items-center">
                            <h3 className="text-sm font-medium tracking-wider uppercase opacity-70">
                                Zen Timer
                            </h3>
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="text-xs opacity-50 hover:opacity-100"
                            >
                                —
                            </button>
                        </div>

                        {/* Timer Display */}
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            {/* Circular Progress (Simplified with SVG) */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    className="stroke-white/10 fill-none"
                                    strokeWidth="6"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    className={cn("fill-none transition-all duration-1000 ease-linear", TIMER_CONFIG[mode].color)}
                                    strokeWidth="6"
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * progress) / 100}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                />
                            </svg>
                            <div className="text-4xl font-light tracking-widest z-10">
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        {/* Mode Toggles */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => switchMode("focus")}
                                className={cn(
                                    "p-2 rounded-full transition-colors",
                                    mode === "focus" ? "bg-rose-500/20 text-rose-400" : "hover:bg-white/5 text-white/50"
                                )}
                                title="Focus"
                            >
                                <Brain size={16} />
                            </button>
                            <button
                                onClick={() => switchMode("shortBreak")}
                                className={cn(
                                    "p-2 rounded-full transition-colors",
                                    mode === "shortBreak" ? "bg-teal-500/20 text-teal-400" : "hover:bg-white/5 text-white/50"
                                )}
                                title="Short Break"
                            >
                                <Coffee size={16} />
                            </button>
                            <button
                                onClick={() => switchMode("longBreak")}
                                className={cn(
                                    "p-2 rounded-full transition-colors",
                                    mode === "longBreak" ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/5 text-white/50"
                                )}
                                title="Long Break"
                            >
                                <Coffee size={20} />
                            </button>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6 mt-2">
                            <button
                                onClick={resetTimer}
                                className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                            >
                                <RotateCcw size={20} />
                            </button>

                            <button
                                onClick={toggleTimer}
                                className="p-4 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
                            >
                                {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
