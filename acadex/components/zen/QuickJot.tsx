"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuickJot() {
    const [isOpen, setIsOpen] = useState(false);
    const [note, setNote] = useState("");

    useEffect(() => {
        const savedNote = localStorage.getItem("zen-quick-jot");
        if (savedNote) setNote(savedNote);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setNote(newVal);
        localStorage.setItem("zen-quick-jot", newVal);
    };

    const clearNote = () => {
        if (confirm("Clear your quick notes?")) {
            setNote("");
            localStorage.removeItem("zen-quick-jot");
        }
    };

    return (
        <div
            className={cn(
                "fixed left-0 top-1/2 -translate-y-1/2 transition-all duration-300 z-50",
                isOpen ? "translate-x-0" : "-translate-x-[280px]"
            )}
        >
            <div className="relative flex">
                {/* Main Note Area */}
                <div className="w-[300px] h-[400px] bg-black/40 backdrop-blur-xl border-r border-y border-white/10 rounded-r-2xl shadow-2xl p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-white/80 font-medium flex items-center gap-2">
                            <Pencil size={14} /> Quick Jot
                        </h3>
                        <button
                            onClick={clearNote}
                            className="text-white/40 hover:text-red-400 p-1 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <textarea
                        className="flex-1 bg-transparent border-none resize-none focus:ring-0 text-white/90 placeholder:text-white/20 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-white/10"
                        placeholder="Capture a thought..."
                        value={note}
                        onChange={handleChange}
                        spellCheck={false}
                    />
                </div>

                {/* Toggle Tab */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-16 w-8 bg-black/40 backdrop-blur-xl border border-l-0 border-white/10 rounded-r-lg flex items-center justify-center hover:bg-white/5 transition-colors absolute left-full top-1/2 -translate-y-1/2"
                >
                    <ChevronRight
                        className={cn(
                            "text-white/70 transition-transform duration-300",
                            isOpen ? "rotate-180" : "rotate-0"
                        )}
                        size={20}
                    />
                </button>
            </div>
        </div>
    );
}
