"use client";

import { useState } from "react";
import { Upload, FileText, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import FlashcardStack, { Flashcard } from "./FlashcardStack";

export default function SnapGenerator() {
    const [mode, setMode] = useState<"input" | "review">("input");
    const [text, setText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [inputType, setInputType] = useState<"text" | "image">("text");

    // --- Generation Logic (Heuristic Cloze Deletion) ---
    const generateCards = (sourceText: string) => {
        const sentences = sourceText.match(/[^.!?]+[.!?]+/g) || [sourceText];
        const newCards: Flashcard[] = [];

        sentences.forEach((sentence, idx) => {
            const clean = sentence.trim();
            if (clean.length < 10) return; // Skip too short

            // Strategy 1: Find definitions (contains " is ", " are ", " means ")
            const defMatch = clean.match(/^(.*?) (is|are|means|refers to) (.*)$/i);

            if (defMatch) {
                // Obscure the subject (Term)
                const term = defMatch[1];
                const body = defMatch[2] + " " + defMatch[3];
                // Create card
                if (term.split(" ").length < 5) { // Ensure term isn't a whole long clause
                    newCards.push({
                        id: `gen-${idx}`,
                        front: `___ ${body}`,
                        back: term
                    });
                    return;
                }
            }

            // Strategy 2: Keyword Blanking (Longest word > 5 chars)
            const words = clean.split(" ");
            const candidates = words.filter(w => w.length > 5 && !/^(this|that|there|which|because|although)/i.test(w));

            if (candidates.length > 0) {
                // Pick random candidate
                const wordToRemove = candidates[Math.floor(Math.random() * candidates.length)];
                // Replace ONLY that instance to avoid confusion, using simple replace
                const q = clean.replace(wordToRemove, "[_____]");
                newCards.push({
                    id: `gen-${idx}-cloze`,
                    front: q,
                    back: wordToRemove.replace(/[.,!?]/g, "") // clean punctuation
                });
            }
        });

        return newCards.length > 0 ? newCards : [
            { id: 'err', front: 'Could not generate cards.', back: 'Try simpler text.' }
        ];
    };

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setIsProcessing(true);

        // Simulate thinking delay for effect
        setTimeout(() => {
            const generated = generateCards(text);
            setCards(generated);
            setMode("review");
            setIsProcessing(false);
        }, 1500);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);

        // 1. Upload
        const formData = new FormData();
        formData.append("file", file);

        try {
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
            if (!uploadRes.ok) throw new Error("Upload failed");
            const { path } = await uploadRes.json();

            // 2. OCR
            const ocrRes = await fetch("/api/ocr", {
                method: "POST",
                body: JSON.stringify({ path }),
                headers: { 'Content-Type': 'application/json' }
            });

            const ocrData = await ocrRes.json();

            if (ocrData.text) {
                setText(ocrData.text);
                setInputType("text"); // Switch to text view to let user edit before generating
            } else {
                alert("No text found in image.");
            }

        } catch (err) {
            console.error(err);
            alert("Something went wrong processing the image.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (mode === "review") {
        return <FlashcardStack cards={cards} onReset={() => { setMode("input"); setText(""); }} />;
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Helper Tabs */}
            <div className="flex border-b">
                <button
                    onClick={() => setInputType("text")}
                    className={cn("flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2", inputType === "text" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50")}
                >
                    <FileText size={16} /> Paste Text
                </button>
                <button
                    onClick={() => setInputType("image")}
                    className={cn("flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2", inputType === "image" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50")}
                >
                    <Upload size={16} /> Upload Image
                </button>
            </div>

            <div className="p-8">
                {inputType === "text" ? (
                    <div className="space-y-4 animate-in fade-in">
                        <textarea
                            className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base leading-relaxed"
                            placeholder="Paste your notes, lecture transcript, or textbook summary here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isProcessing || !text.trim()}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <><Loader2 className="animate-spin" /> Analyzing...</>
                            ) : (
                                <><Sparkles /> Snap Flashcards</>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-500 gap-4 hover:bg-gray-50 hover:border-blue-300 transition-colors animate-in fade-in relative">
                        {isProcessing ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                                <p className="text-sm font-medium">Extracting Text...</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                    <Upload size={32} />
                                </div>
                                <p className="font-medium">Click to upload or drag & drop</p>
                                <p className="text-xs text-gray-400">Supports PNG, JPG (Max 5MB)</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleUpload}
                                />
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
