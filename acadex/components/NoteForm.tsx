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
      className="p-10 max-w-5xl mx-auto space-y-8 bg-white border border-gray-100 shadow-2xl rounded-2xl mt-12 transition duration-300 hover:shadow-3xl"
    >
      <h1 className="text-4xl font-extrabold text-center text-gray-900 tracking-tight border-b pb-4">
        {noteId ? "✏️ Edit Academic Note" : "✍️ Create New Academic Note"}
      </h1>

      {message && (
        <div
          className={`p-4 rounded-lg text-center font-medium border ${message.includes("Error")
            ? "bg-red-50 text-red-700 border-red-300"
            : "bg-green-50 text-green-700 border-green-300"
            }`}
        >
          {message}
        </div>
      )}

      {/* Title */}
      <div className="text-black">
        <label className="block text-gray-700 font-semibold mb-2">
          Note Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g., Dijkstra's Algorithm: A Simple Explanation"
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition duration-150 shadow-sm"
        />
      </div>

      {/* Course and Topic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Course (e.g., CSE 4510)
          </label>
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
            placeholder="Course Code"
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition duration-150 shadow-sm"
          />
        </div>
        <div className="text-black">
          <label className="block text-gray-700 font-semibold mb-2">
            Topic (e.g., Graph Theory)
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            placeholder="Specific Topic Name"
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition duration-150 shadow-sm"
          />
        </div>
      </div>

      {/* Visibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Visibility
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition duration-150 shadow-sm bg-white"
          >
            <option value="public">Public (Everyone can see)</option>
            <option value="private">Private (Only you can see)</option>
            <option value="group">Group (Only members can see)</option>
          </select>
        </div>
        {visibility === "group" && (
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Select Group
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required={visibility === "group"}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition duration-150 shadow-sm bg-white"
            >
              <option value="">-- Choose a Group --</option>
              {userGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {userGroups.length === 0 && (
              <p className="text-xs text-red-500 mt-1">You are not in any groups. Join one first!</p>
            )}
          </div>
        )}
      </div>

      {/* Content (Markdown Editor Area) */}
      <div className="">
        <div className="w-fit h-fit flex items-center justify-center">
          <label className="block text-gray-700 font-semibold">Content</label>
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleButtonClick}
            className="bg-green-600 ml-10 px-4 py-2 rounded-2xl transition-all duration-300 hover:bg-green-700 cursor-pointer flex items-center justify-center"
          >
            <p className="font-bold">📃 Upload file</p>
          </button>

          <button
            type="button"
            onClick={() => setShowPad((s) => !s)}
            className="bg-purple-600 ml-10 px-4 py-2 rounded-2xl transition-all duration-300 hover:bg-purple-700 cursor-pointer flex items-center justify-center"
          >
            <p className="font-bold">
              {showPad ? "🧾 Hide Ink Pad" : "🖊️ Handwriting Pad"}
            </p>
          </button>

          <button
            type="button"
            onClick={handleHandwritingButtonClick}
            className="bg-blue-600 ml-10 px-4 py-2 rounded-2xl transition-all duration-300 hover:bg-blue-700 cursor-pointer flex items-center justify-center"
          >
            <p className="font-bold">✍️ Scan Handwriting</p>
          </button>

          <button
            type="button"
            onClick={handleVoiceButtonClick}
            className="bg-amber-600 ml-10 px-4 py-2 rounded-2xl transition-all duration-300 hover:bg-amber-700 cursor-pointer flex items-center justify-center"
          >
            <p className="font-bold">🎙️ Voice to Text</p>
          </button>
        </div>
      </div>
      <div className=" text-white p-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-light tracking-tighter"></h1>
            <p className="text-zinc-500 text-sm"></p>
          </header>

          {showPad && (
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
          )}

          <Tiptap
            content={content}
            onChange={(newHtml) => setContent(newHtml)}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-[1.005] disabled:bg-gray-400 disabled:shadow-none"
      >
        {loading ? "Processing..." : noteId ? "Save Changes" : "🚀 Publish Note to Acadex"}
      </button>
    </form>
  );
}
