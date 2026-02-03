"use client";

import { useState } from "react";
import { Image as ImageIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type BackgroundOption = {
    id: string;
    name: string;
    type: "video" | "image";
    url: string;
    thumbnail: string;
};

const BACKGROUNDS: BackgroundOption[] = [
    {
        id: "rain",
        name: "Rainy Cafe",
        type: "video",
        url: "https://res.cloudinary.com/demo/video/upload/v1689625907/samples/landscapes/beach-waves.mp4",
        thumbnail: "bg-slate-800",
    },
    {
        id: "forest",
        name: "Midnight Forest",
        type: "image",
        url: "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=2070&auto=format&fit=crop",
        thumbnail: "bg-emerald-900",
    },
    {
        id: "minimal",
        name: "Deep Space",
        type: "image",
        url: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2072&auto=format&fit=crop",
        thumbnail: "bg-indigo-950",
    },
    {
        id: "lofi",
        name: "Sunset Lo-fi",
        type: "image",
        url: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop",
        thumbnail: "bg-orange-900",
    },
];

interface BackgroundSelectorProps {
    currentBg: string;
    onSelect: (bg: BackgroundOption) => void;
}

export default function BackgroundSelector({ currentBg, onSelect }: BackgroundSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed top-8 right-8 z-50">
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white/80 hover:bg-white/10 transition-colors border border-white/10"
                >
                    <ImageIcon size={16} />
                    <span className="text-sm font-medium">Themes</span>
                </button>

                {isOpen && (
                    <div className="absolute top-full right-0 mt-3 w-64 p-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-1">
                            {BACKGROUNDS.map((bg) => (
                                <button
                                    key={bg.id}
                                    onClick={() => {
                                        onSelect(bg);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center w-full gap-3 p-2 rounded-lg transition-colors text-left",
                                        currentBg === bg.id ? "bg-white/20" : "hover:bg-white/10"
                                    )}
                                >
                                    <div className={cn("w-10 h-10 rounded-md bg-cover bg-center shrink-0 border border-white/10", bg.thumbnail)}
                                        style={bg.type === 'image' ? { backgroundImage: `url(${bg.url})` } : undefined}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{bg.name}</p>
                                        <p className="text-xs text-white/50 capitalize">{bg.type}</p>
                                    </div>
                                    {currentBg === bg.id && <Check size={14} className="text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
