"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function SchedulePage() {
    const [user, setUser] = useState<{ id: string; username: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function checkAuth() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", user.id)
                .single();

            setUser({ id: user.id, username: profile?.username || "User" });
            setLoading(false);
        }

        checkAuth();
    }, [router, supabase]);

    if (loading) {
        return <div className="p-12 text-center text-lg">Loading Schedule...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-4xl font-bold text-gray-900">
                        🗓️ My Schedule
                    </h1>
                    <Link
                        href="/dashboard"
                        className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
                    >
                        Back to Dashboard
                    </Link>
                </div>

                {/* Welcome Message */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Welcome, {user.username}!
                    </h2>
                    <p className="text-gray-600">
                        Organize your study schedule and manage your time effectively.
                    </p>
                </div>

                {/* Weekly Schedule Grid */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Weekly Schedule
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-3 text-left font-semibold">Time</th>
                                    <th className="border p-3 text-left font-semibold">Monday</th>
                                    <th className="border p-3 text-left font-semibold">Tuesday</th>
                                    <th className="border p-3 text-left font-semibold">Wednesday</th>
                                    <th className="border p-3 text-left font-semibold">Thursday</th>
                                    <th className="border p-3 text-left font-semibold">Friday</th>
                                    <th className="border p-3 text-left font-semibold">Saturday</th>
                                    <th className="border p-3 text-left font-semibold">Sunday</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    "8:00 AM",
                                    "9:00 AM",
                                    "10:00 AM",
                                    "11:00 AM",
                                    "12:00 PM",
                                    "1:00 PM",
                                    "2:00 PM",
                                    "3:00 PM",
                                    "4:00 PM",
                                    "5:00 PM",
                                ].map((time) => (
                                    <tr key={time} className="hover:bg-gray-50">
                                        <td className="border p-3 font-medium text-gray-700">
                                            {time}
                                        </td>
                                        {[...Array(7)].map((_, i) => (
                                            <td
                                                key={i}
                                                className="border p-3 text-sm text-gray-500 cursor-pointer hover:bg-blue-50"
                                            >
                                                {/* Empty cell - can be clicked to add events */}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                        📝 Coming Soon
                    </h3>
                    <p className="text-sm text-blue-800">
                        This is a basic schedule view. Future updates will include:
                    </p>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
                        <li>• Add and edit schedule events</li>
                        <li>• Set reminders for classes and study sessions</li>
                        <li>• Sync with your course schedule</li>
                        <li>• Color-coded events by subject</li>
                        <li>• Export to calendar apps</li>
                    </ul>
                </div>
            </div>
        </div>
    );
=======
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
    [routine]
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
>>>>>>> origin/main
}
