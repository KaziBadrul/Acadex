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
            <div className="flex flex-col items-center justify-center p-12 bg-card rounded-[2rem] shadow-subtle border border-muted/20 text-center animate-swoop-in">
                <CheckCircle2 size={64} className="text-green-500 mb-6" />
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight">All Done!</h2>
                <p className="text-muted mt-3 mb-8 text-lg">You&apos;ve successfully reviewed {cards.length} cards.</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setFinished(false);
                            setCurrentIndex(0);
                        }}
                        className="px-8 py-3 border-2 border-primary/20 text-primary rounded-xl font-medium hover:bg-primary/5 transition-all outline-none"
                    >
                        Review Again
                    </button>
                    <button
                        onClick={onReset}
                        className="px-8 py-3 bg-primary text-background rounded-xl font-medium hover:bg-primary/90 transition-all shadow-md outline-none"
                    >
                        Finish Session
                    </button>
                </div>
            </div>
        );
    }

    const progress = Math.round(((currentIndex + 1) / cards.length) * 100);

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto perspective-1000">
            {/* Progress */}
            <div className="w-full space-y-2">
                <div className="w-full flex justify-between text-sm font-semibold text-primary/60">
                    <span>Card {currentIndex + 1} of {cards.length}</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-muted/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Card Container */}
            <div
                className="relative w-full aspect-[4/3] sm:aspect-video cursor-pointer group"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className={cn(
                    "w-full h-full relative preserve-3d transition-transform duration-700 ease-out-back",
                    isFlipped ? "rotate-y-180" : ""
                )}>
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-card rounded-[2rem] shadow-subtle border border-muted/20 p-8 md:p-12 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
                        <span className="text-xs font-bold text-primary/40 uppercase tracking-[0.2em] mb-6">Question</span>
                        <p className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed">
                            {currentCard?.front}
                        </p>
                        <div className="absolute bottom-8 text-primary/40 flex items-center gap-2 text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                            <RotateCw size={16} /> Tap to flip
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary rounded-[2rem] shadow-xl p-8 md:p-12 flex flex-col items-center justify-center text-center text-background">
                        <span className="text-xs font-bold text-background/50 uppercase tracking-[0.2em] mb-6">Answer</span>
                        <p className="text-2xl md:text-3xl font-bold leading-relaxed text-background">
                            {currentCard?.back}
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mt-2 w-full justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        disabled={currentIndex === 0}
                        className="p-4 rounded-xl bg-card border border-muted/20 text-primary hover:bg-muted/10 disabled:opacity-40 disabled:hover:bg-card transition-all shadow-sm outline-none"
                        title="Previous"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleShuffle(); }}
                        className="p-4 rounded-xl bg-card border border-muted/20 text-primary hover:bg-muted/10 transition-all shadow-sm outline-none"
                        title="Shuffle Deck"
                    >
                        <Sparkles size={22} />
                    </button>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="flex-1 px-8 py-4 rounded-xl bg-primary text-background font-semibold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-3 outline-none"
                >
                    {currentIndex === cards.length - 1 ? "Finish" : "Next Card"} <ChevronRight size={22} />
                </button>
            </div>
        </div>
    );
}
