import { RoutineEvent } from "./types";

const DAY_REGEX = /\b(mon|tue|wed|thu|fri)\b/i;
const COURSE_REGEX = /\bCSE\s?\d{4}\b|\bMATH\s?\d{4}\b/i;

const DAY_MAP: Record<string, RoutineEvent["day"]> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
};

function id() {
  return Math.random().toString(36).slice(2, 9);
}

function preprocessOCR(text: string) {
  return text
    .replace(/[©™=~_`]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 6)
    .filter((l) => !/^teachers?/i.test(l))
    .join("\n");
}

export function parseRoutine(rawText: string): RoutineEvent[] {
  const text = preprocessOCR(rawText);
  const lines = text.split("\n");

  let currentDay: RoutineEvent["day"] | null = null;
  const events: RoutineEvent[] = [];

  for (const line of lines) {
    const dayMatch = line.match(DAY_REGEX);
    if (dayMatch) {
      currentDay = DAY_MAP[dayMatch[1].toLowerCase()];
    }

    const courses = line.match(new RegExp(COURSE_REGEX, "g"));

    if (currentDay && courses) {
      for (const course of courses) {
        let confidence = 0.4;
        confidence += currentDay ? 0.3 : 0;
        confidence += courses ? 0.3 : 0;

        events.push({
          id: id(),
          title: course.replace(/\s+/g, " "),
          day: currentDay,
          start: "08:00",
          end: "09:30",
          confidence,
          raw: line,
        });
      }
    }
  }

  return events;
}
