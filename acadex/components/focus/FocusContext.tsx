"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { TreePine, Waves, Coffee, CloudRain } from "lucide-react";

export type FocusTab = "zen" | "smart" | "custom";
export type SmartMode = "focus" | "short" | "long";

export interface Background {
    id: string;
    name: string;
    url: string;
    icon: React.ReactNode;
}

export const BACKGROUNDS: Background[] = [
    {
        id: "forest",
        name: "Midnight Forest",
        url: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop",
        icon: <TreePine className="w-4 h-4" />
    },
    {
        id: "ocean",
        name: "Ocean Waves",
        url: "https://images.unsplash.com/photo-1439405326854-01517489c73e?q=80&w=2000&auto=format&fit=crop",
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

interface FocusContextType {
    isRunning: boolean;
    remainingMs: number;
    distractionCount: number;
    activeBg: Background;
    activeTab: FocusTab;
    smartMode: SmartMode;
    zenDuration: number;
    customMinutes: number;
    setIsRunning: (v: boolean) => void;
    setDistractionCount: (v: number | ((c: number) => number)) => void;
    setActiveBg: (bg: Background) => void;
    setActiveTab: (tab: FocusTab) => void;
    setSmartMode: (mode: SmartMode) => void;
    setZenDuration: (mins: number) => void;
    setCustomMinutes: (mins: number) => void;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: (mins: number) => void;
    formatTime: (ms: number) => string;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: React.ReactNode }) {
    const [activeTab, setActiveTab] = useState<FocusTab>("zen");
    const [isRunning, setIsRunning] = useState(false);
    const [remainingMs, setRemainingMs] = useState(25 * 60 * 1000);
    const [endAt, setEndAt] = useState<number | null>(null);
    const [activeBg, setActiveBg] = useState<Background>(BACKGROUNDS[0]);
    const [distractionCount, setDistractionCount] = useState(0);
    const [zenDuration, setZenDuration] = useState(25);
    const [smartMode, setSmartMode] = useState<SmartMode>("focus");
    const [customMinutes, setCustomMinutes] = useState(40);

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

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <FocusContext.Provider value={{
            isRunning, remainingMs, distractionCount, activeBg, activeTab, smartMode,
            zenDuration, customMinutes,
            setIsRunning, setDistractionCount, setActiveBg, setActiveTab, setSmartMode,
            setZenDuration, setCustomMinutes,
            startTimer, pauseTimer, resetTimer, formatTime
        }}>
            {children}
        </FocusContext.Provider>
    );
}

export function useFocus() {
    const context = useContext(FocusContext);
    if (context === undefined) {
        throw new Error("useFocus must be used within a FocusProvider");
    }
    return context;
}
