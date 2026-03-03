"use client";

import { useFocus } from "./FocusContext";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

export default function FocusWidget() {
    const { isRunning, remainingMs, distractionCount, setDistractionCount, formatTime } = useFocus();
    const pathname = usePathname();

    // Hide widget if not running or if we are on the focus page itself
    if (!isRunning || pathname === "/focus") return null;

    return (
        <div className="fixed top-8 right-8 z-[60] animate-in fade-in slide-in-from-right-8 duration-500">
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
    );
}
