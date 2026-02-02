"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ReminderPopup from "@/components/ReminderPopup";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Reminder = {
    id: string;
    creator_id: string;
    title: string;
    description: string | null;
    remind_at: string;
    priority: "low" | "medium" | "high";
    is_public: boolean;
    created_at: string;
};

type NotificationReminder = Reminder & {
    daysLeft: number;
};

const ReminderNotificationContext = createContext<{
    checkReminders: () => void;
}>({
    checkReminders: () => { },
});

export function useReminderNotifications() {
    return useContext(ReminderNotificationContext);
}

export default function ReminderNotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [notificationReminder, setNotificationReminder] =
        useState<NotificationReminder | null>(null);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const [isChecking, setIsChecking] = useState(false);

    // We use a ref to track timeouts to avoid double-setting
    const nextCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    function getDaysUntilReminder(remindAt: string): number {
        const now = new Date();
        const reminderDate = new Date(remindAt);
        const diffTime = reminderDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    async function checkReminders() {
        if (isChecking) return;
        setIsChecking(true);

        try {
            const { data, error } = await supabase
                .from("reminders")
                .select("*")
                .eq("is_public", true)
                .order("remind_at", { ascending: true });

            if (error) {
                console.error("Error fetching reminders:", error);
                setIsChecking(false);
                return;
            }

            if (!data || data.length === 0) {
                setIsChecking(false);
                return;
            }

            const now = new Date();
            let found = false;

            for (const reminder of data as Reminder[]) {
                if (dismissedIds.has(reminder.id)) continue;

                const reminderDate = new Date(reminder.remind_at);
                const diffMs = reminderDate.getTime() - now.getTime();

                // CASE 1: Reminder is PASSED (or exactly now)
                // We assume "passed" means within the last 24 hours (so we don't spam for year-old stuff)
                if (diffMs <= 0) {
                    // 24 hours in ms = 86400000
                    if (Math.abs(diffMs) < 86400000) {
                        setNotificationReminder({
                            ...reminder,
                            daysLeft: getDaysUntilReminder(reminder.remind_at)
                        });
                        found = true;
                        break; // Show one at a time
                    }
                }

                // CASE 2: Reminder is VERY SOON (within 15 seconds)
                // We set a precise timeout so the user sees it pop exactly when it's due
                else if (diffMs < 15000) {
                    console.log(`Setting precise timeout for reminder '${reminder.title}' in ${diffMs}ms`);

                    if (nextCheckTimeoutRef.current) clearTimeout(nextCheckTimeoutRef.current);

                    nextCheckTimeoutRef.current = setTimeout(() => {
                        // Re-run check strictly when time is up
                        checkReminders();
                    }, diffMs + 100); // 100ms buffer to ensure we pass the >= check
                }
            }
        } catch (err) {
            console.error("Error in checkReminders:", err);
        } finally {
            setIsChecking(false);
        }
    }

    function handleDismiss() {
        if (notificationReminder) {
            setDismissedIds((prev) => new Set(prev).add(notificationReminder.id));
            setNotificationReminder(null);

            // Check immediately for other reminders
            setTimeout(checkReminders, 1000);
        }
    }

    useEffect(() => {
        // Initial check
        checkReminders();

        // High frequency polling: Check every 10 seconds
        // This ensures we catch new reminders or "missed" timeouts quickly
        const interval = setInterval(checkReminders, 10000);

        return () => {
            clearInterval(interval);
            if (nextCheckTimeoutRef.current) clearTimeout(nextCheckTimeoutRef.current);
        };
    }, [dismissedIds]);

    return (
        <ReminderNotificationContext.Provider value={{ checkReminders }}>
            {children}
            {notificationReminder && (
                <ReminderPopup
                    reminder={notificationReminder}
                    onDismiss={handleDismiss}
                />
            )}
        </ReminderNotificationContext.Provider>
    );
}
