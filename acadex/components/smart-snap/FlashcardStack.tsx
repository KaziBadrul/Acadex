"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type Flashcard = {
    id: string;
    front: string;
    back: string;
};

interface FlashcardStackProps {
    cards: Flashcard[];
    onReset: () => void;
}

export default function FlashcardStack({ cards: initialCards, onReset }: FlashcardStackProps) {
    const [cards, setCards] = useState<Flashcard[]>(initialCards);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [finished, setFinished] = useState(false);

    const currentCard = cards[currentIndex];

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                setFinished(true);
            }
        }, 150);
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
        }
    };

    const handleShuffle = () => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    if (finished) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-xl border border-gray-100 text-center animate-in fade-in zoom-in duration-500">
                <CheckCircle2 size={64} className="text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">All Done!</h2>
                <p className="text-gray-500 mt-2 mb-6">You&apos;ve reviewed {cards.length} cards.</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setFinished(false);
                            setCurrentIndex(0);
                        }}
                        className="px-6 py-2 border border-gray-200 text-gray-600 rounded-full font-medium hover:bg-gray-50 transition"
                    >
                        Review Again
                    </button>
                    <button
                        onClick={onReset}
                        className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
                    >
                        Finish Session
                    </button>
                </div>
            </div>
        );
    }

    const progress = Math.round(((currentIndex + 1) / cards.length) * 100);

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto perspective-1000">
            {/* Progress */}
            <div className="w-full flex justify-between text-sm font-medium text-gray-400">
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Card Container */}
            <div
                className="relative w-full aspect-[4/3] cursor-pointer group"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className={cn(
                    "w-full h-full relative preserve-3d transition-all duration-500 ease-out-back",
                    isFlipped ? "rotate-y-180" : ""
                )}>
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">Question</span>
                        <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
                            {currentCard.front}
                        </p>
                        <div className="absolute bottom-6 text-gray-300 flex items-center gap-2 text-xs">
                            <RotateCw size={12} /> Tap to flip
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 p-8 flex flex-col items-center justify-center text-center text-white">
                        <span className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-4">Answer</span>
                        <p className="text-xl md:text-2xl font-bold leading-relaxed">
                            {currentCard.back}
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-4 w-full justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        disabled={currentIndex === 0}
                        className="p-3 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition shadow-sm"
                        title="Previous"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleShuffle(); }}
                        className="p-3 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition shadow-sm"
                        title="Shuffle Deck"
                    >
                        <Sparkles size={18} />
                    </button>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="flex-1 px-8 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
                >
                    {currentIndex === cards.length - 1 ? "Finish" : "Next Card"} <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
