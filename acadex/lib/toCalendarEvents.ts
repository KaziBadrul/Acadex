import { RoutineEvent } from "./types";

const dayIndex: Record<RoutineEvent["day"], number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day); // Sunday as week start
  return x;
}

export function toFullCalendarEvents(routine: RoutineEvent[]) {
  const weekStart = startOfWeek(new Date());

  return routine.map((r) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex[r.day]);

    const yyyyMmDd = date.toISOString().slice(0, 10);

    return {
      id: r.id,
      title: r.location ? `${r.title} (${r.location})` : r.title,
      start: `${yyyyMmDd}T${r.start}:00`,
      end: `${yyyyMmDd}T${r.end}:00`,
      extendedProps: {
        confidence: r.confidence,
        raw: r.raw,
        location: r.location,
        day: r.day,
      },
    };
  });
}
