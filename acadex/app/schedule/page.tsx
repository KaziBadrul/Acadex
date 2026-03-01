"use client";

import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { IngestResponse, RoutineEvent } from "@/lib/types";
import { toFullCalendarEvents } from "@/lib/toCalendarEvents";
import { Calendar as CalendarIcon, UploadCloud, X, Save, Image as ImageIcon, AlertCircle, FileText, ChevronDown } from "lucide-react";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [routine, setRoutine] = useState<RoutineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showOcr, setShowOcr] = useState(false);

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
    <main className="w-full pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 border-b border-muted/20 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/70">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              Routine Importer
            </h1>
            <p className="text-primary/60 text-sm mt-1">
              Upload an image of your class schedule to auto-generate calendar events.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* LEFT PANEL */}
        <div className="w-full xl:w-[400px] shrink-0 space-y-6">
          <div className="bg-card rounded-2xl shadow-subtle border border-muted/20 p-6">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-accent" /> Upload Image
            </h2>

            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                }}
              />
              <div className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${loading ? "border-muted/30 bg-muted/5 opacity-70" : "border-muted/30 bg-background/50 group-hover:border-primary/30 group-hover:bg-muted/5"
                }`}>
                {loading ? (
                  <>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/10">
                      <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                    <p className="font-semibold text-primary">Processing Image...</p>
                    <p className="text-xs text-primary/50 mt-1">Extracting your schedule using OCR</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-muted/10 text-primary/40 group-hover:text-primary/60 transition-colors">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-primary">Click to upload image</p>
                    <p className="text-xs text-primary/50 mt-1">PNG, JPG, HEIC</p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {imagePath && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-primary/60 uppercase tracking-wider mb-2">Original Image</p>
                <div className="rounded-xl border border-muted/20 overflow-hidden bg-muted/5">
                  <img
                    src={imagePath}
                    alt="routine"
                    className="w-full object-contain max-h-[200px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* DETECTED EVENTS */}
          {routine.length > 0 && (
            <div className="bg-card rounded-2xl shadow-subtle border border-muted/20 p-6 flex flex-col max-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" /> Detected Events
                </h2>
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">{routine.length} found</span>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
                {routine.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 bg-background border border-muted/20 rounded-xl relative group hover:border-accent/30 transition-colors"
                  >
                    <button
                      onClick={() => removeEvent(ev.id)}
                      className="absolute top-2 right-2 p-1.5 text-muted hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Remove event"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="font-bold text-primary pr-6 truncate">{ev.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-sm text-primary/70">
                      <span className="font-medium bg-muted/10 px-2 py-0.5 rounded text-xs">{ev.day}</span>
                      <span className="tabular-nums font-medium bg-muted/10 px-2 py-0.5 rounded text-xs">{ev.start}-{ev.end}</span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${ev.confidence > 0.8 ? 'bg-green-500' : ev.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.max(10, ev.confidence * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-primary/50 uppercase w-8 text-right">
                        {(ev.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-muted/10 flex gap-2">
                <button
                  onClick={() => {
                    localStorage.setItem("routine_events", JSON.stringify(routine));
                    alert("Saved to localStorage (demo).");
                  }}
                  className="flex-1 bg-primary text-white font-medium py-2.5 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Save Schedule
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - CALENDAR */}
        <div className="flex-1 min-w-[320px] bg-card rounded-2xl shadow-subtle border border-muted/20 p-6 flex flex-col w-full overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary">Calendar Preview</h2>
            <p className="text-xs font-semibold text-primary/50 uppercase tracking-wider bg-muted/10 px-3 py-1.5 rounded-lg hidden sm:block">Drag & drop to adjust</p>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-muted/20">
            {/* The calendar container */}
            <div className="min-w-[700px]">
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
                eventColor="#30364f"
                eventTextColor="#ffffff"
                eventBorderColor="transparent"
              />
            </div>
          </div>

          {ocrText && (
            <div className="mt-8 border-t border-muted/20 pt-6">
              <button
                onClick={() => setShowOcr(!showOcr)}
                className="flex items-center gap-2 text-sm font-bold text-primary/60 hover:text-primary transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showOcr ? 'rotate-180' : ''}`} />
                Show Raw OCR Text (Debug)
              </button>

              {showOcr && (
                <div className="mt-4 bg-background border border-muted/20 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-xs text-primary/70 font-mono whitespace-pre-wrap leading-relaxed max-w-full">
                    {ocrText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main >
  );
}


