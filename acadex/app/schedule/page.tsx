"use client";

import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { IngestResponse, RoutineEvent } from "@/lib/types";
import { toFullCalendarEvents } from "@/lib/toCalendarEvents";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [routine, setRoutine] = useState<RoutineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  function startOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function endOfWeek(date: Date) {
    const d = startOfWeek(date);
    d.setDate(d.getDate() + 7);
    return d;
  }

  const calendarEvents = useMemo(
    () => toFullCalendarEvents(routine),
    [routine],
  );

  async function onUpload(file: File) {
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/routine/ingest", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as IngestResponse;

      if (!data.success) throw new Error(data.error || "Upload failed");

      setImagePath(data.imagePath ?? null);
      setOcrText(data.ocrText ?? "");
      setRoutine(data.routineEvents ?? []);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  function removeEvent(id: string) {
    setRoutine((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-4">
        Routine Image → Calendar (Drag & Drop)
      </h1>

      <div className="flex flex-wrap gap-6 items-start">
        {/* LEFT PANEL */}
        <div className="w-full md:w-[320px] bg-white rounded-xl shadow p-4">
          <label className="block font-semibold mb-2">
            Upload routine image
          </label>

          <input
            type="file"
            accept="image/*"
            disabled={loading}
            className="block w-full text-sm text-gray-700
            file:mr-3 file:py-1.5 file:px-3
            file:rounded-md file:border-0
            file:bg-blue-600 file:text-white
            hover:file:bg-blue-700"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
            }}
          />

          {loading && (
            <p className="mt-2 text-sm text-blue-600">Processing OCR…</p>
          )}

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {imagePath && (
            <div className="mt-4">
              <p className="font-semibold mb-2">Uploaded image</p>
              <img
                src={imagePath}
                alt="routine"
                className="w-full rounded-lg border"
              />
            </div>
          )}

          {/* DETECTED EVENTS */}
          <div className="mt-4">
            <p className="font-semibold mb-2">Detected events</p>

            <div className="max-h-72 overflow-y-auto border rounded-lg">
              {routine.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">No events yet.</div>
              ) : (
                routine.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 border-b last:border-b-0 flex justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold">{ev.title}</p>
                      <p className="text-sm text-gray-600">
                        {ev.day} • {ev.start}-{ev.end}
                      </p>
                      <p className="text-xs text-gray-500">
                        confidence {(ev.confidence * 100).toFixed(0)}%
                      </p>
                    </div>

                    <button
                      onClick={() => removeEvent(ev.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => {
                localStorage.setItem("routine_events", JSON.stringify(routine));
                alert("Saved to localStorage (demo).");
              }}
              disabled={routine.length === 0}
              className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg
              disabled:opacity-50 hover:bg-green-700"
            >
              Save (demo)
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 min-w-[320px] bg-white rounded-xl shadow p-4">
          <p className="font-semibold mb-3">Calendar (drag & drop to fix)</p>

          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            /* 🔒 Single fixed week */
            validRange={{
              start: startOfWeek(new Date()),
              end: endOfWeek(new Date()),
            }}
            headerToolbar={false}
            allDaySlot={false}
            /* ⏱️ 15-minute intervals */
            slotDuration="00:15:00"
            snapDuration="00:15:00"
            slotLabelInterval="01:00"
            slotMinTime="07:00:00"
            slotMaxTime="19:00:00"
            editable
            eventResizableFromStart={true}
            events={calendarEvents}
            nowIndicator
            height="auto"
          />

          <details className="mt-4">
            <summary className="cursor-pointer font-semibold">
              Show OCR text (debug)
            </summary>
            <pre className="mt-2 text-sm bg-gray-100 p-3 rounded-lg whitespace-pre-wrap">
              {ocrText || "(empty)"}
            </pre>
          </details>
        </div>
      </div>
    </main>
  );
}
