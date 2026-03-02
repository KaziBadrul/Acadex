// components/NoteForm.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { updateNote } from "@/app/notes/actions";
import Tiptap from "./Tiptap";
import HandwritingPad from "./HandwritingPad";

// import ReactMarkdown from 'react-markdown' // Uncomment if you want an in-page preview

interface NoteFormProps {
  noteId?: number;
  initialData?: {
    title: string;
    content: string;
    course: string;
    topic: string;
    visibility: string;
    group_id: string | null;
  };
}

export default function NoteForm({ noteId, initialData }: NoteFormProps) {
  const supabase = createClient();
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [course, setCourse] = useState(initialData?.course || "");
  const [topic, setTopic] = useState(initialData?.topic || "");
  const [visibility, setVisibility] = useState(initialData?.visibility || "public");
  const [groupId, setGroupId] = useState(initialData?.group_id || "");
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPad, setShowPad] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const transcript = localStorage.getItem("voice_transcript");

    if (transcript) {
      setContent((prev) => (prev ? prev + "\n\n" + transcript : transcript));
      localStorage.removeItem("voice_transcript");
    }

    // Fetch user groups for visibility selection
    async function loadGroups() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: memberships } = await supabase
          .from("group_members")
          .select("groups(id, name)")
          .eq("user_id", user.id);

        if (memberships) {
          setUserGroups(memberships.map((m: any) => m.groups));
        }
      }
    }
    loadGroups();
  }, [supabase]);

  const router = useRouter();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleHandwritingButtonClick = () => {
    router.push("/notes/upload/handwriting");
  };

  const handleVoiceButtonClick = () => {
    router.push("/transcription");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("Uploading file...");

    const parseJsonSafe = async (res: Response) => {
      const raw = await res.text();
      try {
        return JSON.parse(raw);
      } catch (e) {
        return { _rawText: raw };
      }
    };

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadJson = await parseJsonSafe(uploadRes);

      if (!uploadRes.ok) {
        const msg = uploadJson?._rawText
          ? uploadJson._rawText
          : JSON.stringify(uploadJson);
        setMessage("Upload failed: " + msg);
        setLoading(false);
        return;
      }

      const uploadedPath = uploadJson?.path as string | undefined;
      if (!uploadedPath) {
        const msg = uploadJson?._rawText
          ? uploadJson._rawText
          : JSON.stringify(uploadJson);
        setMessage("Upload did not return a path: " + msg);
        setLoading(false);
        return;
      }

      setMessage("File uploaded. Running OCR...");

      const ocrRes = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: uploadedPath }),
      });
      const ocrJson = await parseJsonSafe(ocrRes);

      if (!ocrRes.ok) {
        const msg = ocrJson?._rawText
          ? ocrJson._rawText
          : JSON.stringify(ocrJson);
        setMessage("OCR request failed: " + msg);
      } else if (ocrJson?.success && typeof ocrJson.text === "string") {
        setContent((prev) =>
          prev ? prev + "\n\n" + ocrJson.text : ocrJson.text,
        );
        setMessage("OCR completed and content inserted into editor.");
      } else {
        const msg =
          ocrJson?.error ?? ocrJson?._rawText ?? JSON.stringify(ocrJson);
        setMessage("OCR failed: " + msg);
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setMessage("Error during upload/OCR: " + String(err));
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. Get the current user's ID
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Error: You must be logged in to create a note.");
      setLoading(false);
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content,
      course: course.trim(),
      topic: topic.trim(),
      visibility: visibility,
      group_id: visibility === "group" ? (groupId || null) : null,
    };

    if (noteId) {
      // EDIT MODE
      const res = await updateNote(noteId, noteData);
      if (res.error) {
        setMessage(`Error updating note: ${res.error}`);
      } else {
        setMessage("Note updated successfully!");
        router.push(`/notes/${noteId}`);
      }
    } else {
      // CREATE MODE
      const { error } = await supabase.from("notes").insert([{
        ...noteData,
        author_id: user.id
      }]);

      if (error) {
        console.error("Database Error:", error);
        setMessage(`Failed to publish note: ${error.message}`);
      } else {
        setMessage("Note published successfully!");
        // Reset form and navigate to the dashboard
        setTitle("");
        setContent("");
        setCourse("");
        setTopic("");
        router.push("/dashboard");
      }
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7 fade-in duration-700"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-5 border-b border-muted/20">
        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/60 shrink-0">
          {noteId ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            {noteId ? "Edit Note" : "New Note"}
          </h1>
          <p className="text-sm text-primary/50 mt-0.5">
            {noteId ? "Update the details of your note below." : "Fill in the details and write your note."}
          </p>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium border flex items-center gap-2 ${message.includes("Error") || message.includes("failed") || message.includes("error")
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-green-50 text-green-700 border-green-200"
            }`}
        >
          <span>{message.includes("Error") || message.includes("failed") || message.includes("error") ? "⚠️" : "✅"}</span>
          {message}
        </div>
      )}

      {/* Main Fields */}
      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-primary/50 mb-2 uppercase tracking-widest">
            Note Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Dijkstra's Algorithm: A Simple Explanation"
            className="w-full px-4 py-3.5 bg-background border border-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-primary placeholder:text-muted font-medium text-base"
          />
        </div>

        {/* Course and Topic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-primary/50 mb-2 uppercase tracking-widest">
              Course Code
            </label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
              placeholder="e.g., CSE 4510"
              className="w-full px-4 py-3 bg-background border border-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-primary placeholder:text-muted font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary/50 mb-2 uppercase tracking-widest">
              Specific Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              placeholder="e.g., Graph Theory"
              className="w-full px-4 py-3 bg-background border border-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-primary placeholder:text-muted font-medium"
            />
          </div>
        </div>

        {/* Visibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-primary/50 mb-2 uppercase tracking-widest">
              Visibility
            </label>
            <div className="relative">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="appearance-none w-full px-4 py-3 bg-background border border-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-primary font-medium cursor-pointer"
              >
                <option value="public">🌍 Public — Everyone can see</option>
                <option value="private">🔒 Private — Only you can see</option>
                <option value="group">👥 Group — Only members can see</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {visibility === "group" && (
            <div>
              <label className="block text-xs font-bold text-primary/50 mb-2 uppercase tracking-widest">
                Select Group
              </label>
              <div className="relative">
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  required={visibility === "group"}
                  className="appearance-none w-full px-4 py-3 bg-background border border-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-primary font-medium cursor-pointer"
                >
                  <option value="">— Choose a Group —</option>
                  {userGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              {userGroups.length === 0 && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  ⚠️ You are not in any groups. Join one first!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-muted/20" />

      {/* Editor Card */}
      <div className="bg-card border border-muted/20 rounded-2xl shadow-subtle overflow-hidden">
        {/* Toolbar */}
        <div className="bg-background border-b border-muted/20 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-primary/40 uppercase tracking-widest">Content</span>

          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleButtonClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-muted/30 hover:border-primary/30 hover:bg-primary/5 text-primary/70 hover:text-primary rounded-lg font-medium transition-all text-sm"
            >
              📄 Upload
            </button>

            <button
              type="button"
              onClick={() => setShowPad((s) => !s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg font-medium transition-all text-sm ${showPad
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-muted/30 hover:border-primary/30 hover:bg-primary/5 text-primary/70 hover:text-primary"
                }`}
            >
              🖊️ {showPad ? "Hide Pad" : "Draw"}
            </button>

            <button
              type="button"
              onClick={handleHandwritingButtonClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-muted/30 hover:border-primary/30 hover:bg-primary/5 text-primary/70 hover:text-primary rounded-lg font-medium transition-all text-sm"
            >
              🔍 Scan
            </button>

            <button
              type="button"
              onClick={handleVoiceButtonClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-muted/30 hover:border-primary/30 hover:bg-primary/5 text-primary/70 hover:text-primary rounded-lg font-medium transition-all text-sm"
            >
              🎙️ Voice
            </button>
          </div>
        </div>

        {/* Handwriting Pad (toggled) */}
        {showPad && (
          <div className="border-b border-muted/20 bg-background/50 p-4">
            <div className="bg-card rounded-xl border border-muted/20 overflow-hidden">
              <HandwritingPad
                disabled={loading}
                onSaveInk={async (blob) => {
                  setLoading(true);
                  setMessage("Uploading handwriting...");
                  try {
                    const file = new File([blob], `handwriting-${Date.now()}.png`, { type: "image/png" });
                    const fd = new FormData();
                    fd.append("file", file);
                    const res = await fetch("/api/handwriting-upload", { method: "POST", body: fd });
                    const json = await res.json().catch(() => null);
                    if (!res.ok) { setMessage("Upload failed: " + (json?.error ?? "Unknown error")); return; }
                    const url = json?.url as string | undefined;
                    if (!url) { setMessage("Upload failed: no url returned"); return; }
                    const imgHtml = `<p></p><img src="${url}" alt="handwriting" />`;
                    setContent((prev) => prev ? prev + imgHtml : `<img src="${url}" alt="handwriting" />`);
                    setMessage("Handwriting inserted into the note!");
                  } catch (e: any) {
                    setMessage("Upload error: " + String(e?.message ?? e));
                  } finally {
                    setLoading(false);
                  }
                }}
                onOcr={async (blob) => {
                  setLoading(true);
                  setMessage("Running handwriting OCR...");
                  try {
                    const file = new File([blob], `handwriting-${Date.now()}.png`, { type: "image/png" });
                    const fd = new FormData();
                    fd.append("file", file);
                    fd.append("title", title || "");
                    fd.append("course", course || "");
                    fd.append("topic", topic || "");
                    const res = await fetch("/api/handwriting-ocr", { method: "POST", body: fd });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json?.error ?? "OCR failed");
                    const text = (json?.text as string) || "";
                    const escaped = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
                    setContent((prev) => prev ? prev + `<p></p><pre>${escaped}</pre>` : `<pre>${escaped}</pre>`);
                    setMessage("OCR text inserted into the editor.");
                  } catch (e: any) {
                    setMessage("OCR error: " + String(e?.message ?? e));
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Rich Text Editor */}
        <div className="min-h-[400px] w-full">
          <Tiptap
            content={content}
            onChange={(newHtml) => setContent(newHtml)}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2 pb-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-base shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : noteId ? (
            "Save Changes"
          ) : (
            "Publish Note →"
          )}
        </button>
      </div>
    </form>
  );
}
