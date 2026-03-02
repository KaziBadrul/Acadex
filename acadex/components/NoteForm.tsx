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
      className="space-y-8 fade-in duration-700"
    >
      <div className="flex items-center justify-between border-b border-neutral-100 pb-6 mb-2">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
          {noteId ? (
            <><span className="text-4xl">✏️</span> Edit Note</>
          ) : (
            <><span className="text-4xl">✨</span> New Note</>
          )}
        </h1>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 ${message.includes("Error") || message.includes("failed")
              ? "bg-red-50/80 text-red-700 border-red-200"
              : "bg-emerald-50/80 text-emerald-700 border-emerald-200"
            }`}
        >
          {message.includes("Error") || message.includes("failed") ? "⚠️ " : "✅ "}
          {message}
        </div>
      )}

      {/* Main Form Fields Container */}
      <div className="space-y-6">
        {/* Title */}
        <div className="group">
          <label className="block text-sm font-bold text-neutral-700 mb-2 transition-colors group-focus-within:text-indigo-600 uppercase tracking-wider">
            Note Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Dijkstra's Algorithm: A Simple Explanation"
            className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 text-neutral-900 placeholder:text-neutral-400 font-medium text-lg shadow-sm"
          />
        </div>

        {/* Course and Topic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-sm font-bold text-neutral-700 mb-2 transition-colors group-focus-within:text-indigo-600 uppercase tracking-wider">
              Course Code
            </label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
              placeholder="e.g., CSE 4510"
              className="w-full px-5 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 text-neutral-900 placeholder:text-neutral-400 font-medium shadow-sm hover:border-neutral-300"
            />
          </div>
          <div className="group">
            <label className="block text-sm font-bold text-neutral-700 mb-2 transition-colors group-focus-within:text-indigo-600 uppercase tracking-wider">
              Specific Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              placeholder="e.g., Graph Theory"
              className="w-full px-5 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 text-neutral-900 placeholder:text-neutral-400 font-medium shadow-sm hover:border-neutral-300"
            />
          </div>
        </div>

        {/* Visibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-sm font-bold text-neutral-700 mb-2 transition-colors group-focus-within:text-indigo-600 uppercase tracking-wider">
              Visibility Settings
            </label>
            <div className="relative">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="appearance-none w-full px-5 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 text-neutral-900 font-medium shadow-sm hover:border-neutral-300 cursor-pointer"
              >
                <option value="public">🌍 Public (Everyone can see)</option>
                <option value="private">🔒 Private (Only you can see)</option>
                <option value="group">👥 Group (Only members can see)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          {visibility === "group" && (
            <div className="group">
              <label className="block text-sm font-bold text-neutral-700 mb-2 transition-colors group-focus-within:text-indigo-600 uppercase tracking-wider">
                Select Group
              </label>
              <div className="relative">
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  required={visibility === "group"}
                  className="appearance-none w-full px-5 py-3.5 bg-neutral-50/50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 text-neutral-900 font-medium shadow-sm hover:border-neutral-300 cursor-pointer"
                >
                  <option value="">-- Choose a Group --</option>
                  {userGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              {userGroups.length === 0 && (
                <p className="text-xs font-semibold text-red-500 mt-2 flex items-center gap-1">
                  <span>⚠️</span> You are not in any groups. Join one first!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent my-10"></div>

      {/* Editor & Media Tools */}
      <div className="bg-white/80 border border-neutral-200/80 rounded-[1.5rem] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="bg-neutral-50/50 border-b border-neutral-200/80 px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-0.5 uppercase tracking-wider text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Content Tools
              </h3>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleButtonClick}
                className="group relative flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50 text-neutral-700 hover:text-indigo-700 rounded-xl font-medium transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md active:scale-95 text-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100/50 text-indigo-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">📄</div>
                <span>Upload</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPad((s) => !s)}
                className={`group relative flex items-center gap-2 px-4 py-2 bg-white border ${showPad ? 'border-purple-300 bg-purple-50 text-purple-700 shadow-inner' : 'border-neutral-200 hover:border-purple-300 hover:bg-purple-50 text-neutral-700 hover:text-purple-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md'} rounded-xl font-medium transition-all duration-200 active:scale-95 text-sm`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100/50 text-purple-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">🖊️</div>
                <span>{showPad ? "Hide Pad" : "Draw"}</span>
              </button>

              <button
                type="button"
                onClick={handleHandwritingButtonClick}
                className="group relative flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 text-neutral-700 hover:text-blue-700 rounded-xl font-medium transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md active:scale-95 text-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100/50 text-blue-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">🔍</div>
                <span>Scan</span>
              </button>

              <button
                type="button"
                onClick={handleVoiceButtonClick}
                className="group relative flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 hover:border-amber-300 hover:bg-amber-50 text-neutral-700 hover:text-amber-700 rounded-xl font-medium transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md active:scale-95 text-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100/50 text-amber-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">🎙️</div>
                <span>Voice</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Tools Area */}
        <div className="w-full bg-white relative">
          {showPad && (
            <div className="border-b border-neutral-100 bg-neutral-50/30 p-4">
              <div className="bg-white rounded-xl border border-neutral-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                <HandwritingPad
                  disabled={loading}
                  onSaveInk={async (blob) => {
                    setLoading(true);
                    setMessage("Uploading handwriting...");

                    try {
                      const file = new File(
                        [blob],
                        `handwriting-${Date.now()}.png`,
                        {
                          type: "image/png",
                        },
                      );

                      const fd = new FormData();
                      fd.append("file", file);

                      const res = await fetch("/api/handwriting-upload", {
                        method: "POST",
                        body: fd,
                      });

                      const json = await res.json().catch(() => null);

                      if (!res.ok) {
                        setMessage(
                          "Upload failed: " + (json?.error ?? "Unknown error"),
                        );
                        return;
                      }

                      const url = json?.url as string | undefined;
                      if (!url) {
                        setMessage("Upload failed: no url returned");
                        return;
                      }

                      // Insert image into TipTap HTML
                      const imgHtml = `<p></p><img src="${url}" alt="handwriting" />`;
                      setContent((prev) =>
                        prev
                          ? prev + imgHtml
                          : `<img src="${url}" alt="handwriting" />`,
                      );

                      setMessage("Handwriting inserted into the note!");
                    } catch (e: any) {
                      setMessage("Upload error: " + String(e?.message ?? e));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onOcr={async (blob) => {
                    // Call your Cloudinary OCR route (FormData based)
                    setLoading(true);
                    setMessage("Running handwriting OCR...");

                    try {
                      const file = new File(
                        [blob],
                        `handwriting-${Date.now()}.png`,
                        {
                          type: "image/png",
                        },
                      );

                      const fd = new FormData();
                      fd.append("file", file);
                      fd.append("title", title || ""); // optional
                      fd.append("course", course || ""); // optional
                      fd.append("topic", topic || ""); // optional

                      const res = await fetch("/api/handwriting-ocr", {
                        method: "POST",
                        body: fd,
                      });

                      const json = await res.json();
                      if (!res.ok) throw new Error(json?.error ?? "OCR failed");

                      const text = (json?.text as string) || "";

                      // TipTap is HTML-based -> escape then insert
                      const escaped = text
                        .replaceAll("&", "&amp;")
                        .replaceAll("<", "&lt;")
                        .replaceAll(">", "&gt;");

                      setContent((prev) =>
                        prev
                          ? prev + `<p></p><pre>${escaped}</pre>`
                          : `<pre>${escaped}</pre>`,
                      );

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

          <div className="min-h-[400px] w-full group-editor">
            <Tiptap
              content={content}
              onChange={(newHtml) => setContent(newHtml)}
            />
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="relative overflow-hidden w-full group py-5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-[1.25rem] font-bold shadow-xl hover:shadow-indigo-500/25 active:scale-[0.98] transition-all duration-300 disabled:from-neutral-300 disabled:to-neutral-400 disabled:shadow-none disabled:active:scale-100 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : noteId ? (
              "Save Changes"
            ) : (
              <>
                Publish to Acadex <span className="text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform inline-block duration-300">↗</span>
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
