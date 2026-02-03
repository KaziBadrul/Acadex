import SnapGenerator from "@/components/smart-snap/SnapGenerator";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Smart Snap | Acadex",
    description: "Generate AI Flashcards instantly",
};

export default function SmartSnapPage() {
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600 to-slate-50 -z-10" />

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-12 text-white">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-4 border border-white/20 shadow-xl">
                        <span className="text-3xl">⚡</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Smart Snap</h1>
                    <p className="text-lg text-blue-100 max-w-xl mx-auto">
                        Turn your messy notes into study superpowers. Paste text or upload an image to instantly generate flashcards.
                    </p>
                </div>

                <SnapGenerator />

                <div className="mt-12 text-center text-sm text-gray-400">
                    <p>Powered by Tesseract OCR & Acadex Heuristics Engine</p>
                </div>
            </main>
        </div>
    );
}
