// components/NoteForm.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
// import ReactMarkdown from 'react-markdown' // Uncomment if you want an in-page preview

export default function NoteForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleHandwritingButtonClick = () => {
    router.push("/notes/upload/handwriting");
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
          prev ? prev + "\n\n" + ocrJson.text : ocrJson.text
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

  // const router = useRouter();
  const supabase = createClient();

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

    // 2. Prepare the data for insertion
    const newNote = {
      author_id: user.id, // Linked to your public.profiles via the trigger we created!
      title: title.trim(),
      content: content,
      course: course.trim(),
      topic: topic.trim(),
      // 'visibility' defaults to 'public' in the DB schema, so we omit it here
    };

    // 3. Insert into the 'notes' table
    const { error } = await supabase.from("notes").insert([newNote]);

    if (error) {
      console.error("Database Error:", error);
      setMessage(`Failed to publish note: ${error.message}`);
    } else {
      setMessage("Note published successfully!");
      // Reset form and navigate to the dashboard/new note page
      setTitle("");
      setContent("");
      setCourse("");
      setTopic("");
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      // Modern styling: Larger padding, subtle background, rounded corners, significant shadow
      className="p-10 max-w-5xl mx-auto space-y-8 bg-white border border-gray-100 shadow-2xl rounded-2xl mt-12 transition duration-300 hover:shadow-3xl"
    >
      <h1 className="text-4xl font-extrabold text-center text-gray-900 tracking-tight border-b pb-4">
        ✍️ Create New Academic Note
      </h1>

      {message && (
        <div
          className={`p-4 rounded-lg text-center font-medium border ${
            message.includes("Error")
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
          // Modern input styling: Deeper padding, better focus ring, smooth corners
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

      {/* Content (Markdown Editor Area) */}
      <div className="">
        <div className="w-fit h-fit flex items-center justify-center mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Content (Supports Markdown)
          </label>
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
            <p className="font-bold">Upload file</p>
          </button>

          <button
            type="button"
            onClick={handleHandwritingButtonClick}
            className="bg-blue-600 ml-10 px-4 py-2 rounded-2xl transition-all duration-300 hover:bg-blue-700 cursor-pointer flex items-center justify-center"
          >
            <p className="font-bold">Scan Handwriting</p>
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={15}
          placeholder="Start writing your note here using Markdown syntax for clear formatting (e.g., # Headings, **bold**, *italics*, lists)..."
          // Styled for a cleaner writing experience
          className="w-full p-5 border border-gray-300 rounded-xl font-mono text-gray-800 resize-y focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition duration-150 shadow-inner bg-gray-50"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        // Premium Button Styling: Brighter color, stronger shadow, subtle hover effect
        className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-[1.005] disabled:bg-gray-400 disabled:shadow-none"
      >
        {loading ? "Publishing Note..." : "🚀 Publish Note to Acadex"}
      </button>
    </form>
  );
}
