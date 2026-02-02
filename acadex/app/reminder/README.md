# Reminder Notification System

## Overview
This reminder system functions as a **strict alarm**: it checks global reminders and triggers a popup notification exactly when the reminder time is reached or passed. 

## Features

### 1. **Time-Based Alarms** ⏰
- The system checks for reminders every **5 minutes** automatically.
- A popup notification appears **ONLY** if the current time has crossed the reminder deadline (`now >= reminder_time`).
- **No pre-notifications**: You will not be bothered before the exact time you set.
- **Safety Window**: Reminders are shown even if you open the app a few hours late (up to 24 hours).

### 2. **Priority Styling**
While the trigger time is strict for all priorities, the popup alerts use color coding to indicate importance:
- **High Priority**: Red theme
- **Medium Priority**: Yellow/Amber theme
- **Low Priority**: Gray theme

### 3. **Smart Handling**
- Reminders are shown relative to the current time (e.g., "Just now", "5 min ago").
- Once dismissed, a reminder will not show again unless the page is reloaded.
- If multiple reminders are due, the most overdue one usually appears first.

## File Structure

```
components/
├── ReminderNotificationProvider.tsx   # Global notification logic (checks time)
└── ReminderPopup.tsx                  # Popup UI (displays alarm)

app/
├── layout.tsx                         # Provider integration
└── reminder/
    ├── page.tsx                       # View reminders
    ├── set/page.tsx                   # Create reminders
```

## How It Works

1. **Provider**: `ReminderNotificationProvider` runs a check every 5 mins.
2. **Logic**: It looks for any public reminder where `Current Time >= Reminder Time`.
3. **Popup**: If found (and not dismissed), it displays the popup.
4. **Content**: The popup shows the title, description, and exactly how long ago the reminder was supposed to trigger.

## Testing the Feature

1. **Create a reminder** at `/reminder/set`
   - Set the time for **1 minute from now** (or a few minutes ago).
   - Choose any priority.
   - Make it public.

2. **Wait**:
   - Wait for the time to pass.
   - Visit any page in the app (or refresh).
   - **Result**: You will see a popup saying "Reminder: [Title]" with "Just now" or "X min ago".

3. **Verify Strictness**:
   - Create a reminder for tomorrow.
   - **Result**: You will NOT see any popup today, regardless of priority.
