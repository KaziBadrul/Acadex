"use client";

import { useEffect, useState } from "react";

export default function BrandLoader() {
    const [visible, setVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Check if this is the first visit in this session
        const hasLoaded = sessionStorage.getItem("acadex-first-load");

        if (!hasLoaded) {
            setShouldRender(true);
            // Wait for animation sequence to complete
            const timer = setTimeout(() => {
                setVisible(false);
                sessionStorage.setItem("acadex-first-load", "true");
                // Remove from DOM after transition
                setTimeout(() => setShouldRender(false), 800);
            }, 2000); // 2s show time

            return () => clearTimeout(timer);
        }
    }, []);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <div className="relative flex flex-col items-center">
                <div
                    className="w-32 md:w-48 h-12 md:h-16 animate-swoop-in bg-[#30364f]"
                    style={{
                        maskImage: "url(/ACADEX.png)",
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                        maskSize: "contain",
                        WebkitMaskImage: "url(/ACADEX.png)",
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        WebkitMaskSize: "contain"
                    }}
                />

                {/* Subtle loading indicator */}
                <div className="mt-8 flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#30364f]/20 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#30364f]/20 animate-pulse [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#30364f]/20 animate-pulse [animation-delay:0.4s]" />
                </div>
            </div>
        </div>
    );
}
