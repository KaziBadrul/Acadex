"use client";

import { useEffect, useState } from "react";

type Reminder = {
    id: string;
    title: string;
    description: string | null;
    remind_at: string;
    priority: "low" | "medium" | "high";
    daysLeft: number;
};

export default function ReminderPopup({
    reminder,
    onDismiss,
}: {
    reminder: Reminder;
    onDismiss: () => void;
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    function handleClose() {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation
    }

    const priorityColors = {
        high: {
            bg: "bg-red-50",
            border: "border-red-300",
            badge: "bg-red-100 text-red-700",
            text: "text-red-800",
        },
        medium: {
            bg: "bg-blue-50",
            border: "border-blue-300",
            badge: "bg-blue-100 text-blue-700",
            text: "text-blue-800",
        },
        low: {
            bg: "bg-green-50",
            border: "border-green-300",
            badge: "bg-green-100 text-green-700",
            text: "text-green-800",
        },
    };

    const colors = priorityColors[reminder.priority];

    // Calculate time status
    const now = new Date();
    const reminderDate = new Date(reminder.remind_at);

    // We only show this popup when now >= reminderDate (controlled by Provider)
    // So we can assume it is "Due" or "Overdue"

    const timeDiff = now.getTime() - reminderDate.getTime();
    const minutesPassed = Math.floor(timeDiff / (1000 * 60));
    const hoursPassed = Math.floor(timeDiff / (1000 * 60 * 60));

    let timeText: string;
    if (minutesPassed < 1) {
        timeText = "Just now";
    } else if (minutesPassed < 60) {
        timeText = `${minutesPassed} min ago`;
    } else if (hoursPassed === 1) {
        timeText = "1 hour ago";
    } else {
        timeText = `${hoursPassed} hours ago`;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: isVisible ? "auto" : "none" }}
        >
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${isVisible ? "opacity-50" : "opacity-0"
                    }`}
                onClick={handleClose}
            />

            {/* Popup */}
            <div
                className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
                    }`}
            >
                {/* Header with priority stripe */}
                <div
                    className={`h-2 rounded-t-2xl ${reminder.priority === "high"
                        ? "bg-red-500"
                        : reminder.priority === "medium"
                            ? "bg-blue-500"
                            : "bg-green-500"
                        }`}
                />

                <div className="p-6">
                    {/* Icon & Close Button */}
                    <div className="flex items-start justify-between mb-4">
                        <div
                            className={`${colors.bg} ${colors.border} border-2 rounded-full p-3`}
                        >
                            <svg
                                className={`w-6 h-6 ${colors.text}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>

                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Reminder
                            </h3>
                            <span
                                className={`text-xs font-semibold px-2 py-1 rounded-full ${colors.badge}`}
                            >
                                {reminder.priority}
                            </span>
                        </div>

                        <p className="text-2xl font-bold text-gray-800 mb-2">
                            {reminder.title}
                        </p>

                        {reminder.description && (
                            <p className="text-gray-600 mb-3 whitespace-pre-wrap">
                                {reminder.description}
                            </p>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                            <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <span className="text-gray-600">
                                {new Date(reminder.remind_at).toLocaleString()}
                            </span>
                        </div>

                        <div
                            className={`mt-3 inline-block px-3 py-1 rounded-lg font-semibold ${colors.bg} ${colors.text}`}
                        >
                            ⏰ {timeText}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleClose}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
}
