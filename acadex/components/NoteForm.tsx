// components/NoteForm.tsx
"use client";

import { useState } from "react";
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

  const router = useRouter();
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
      className="p-8 max-w-4xl mx-auto space-y-6 bg-white shadow-lg rounded-xl mt-8"
    >
      <h1 className="text-3xl font-bold text-center">
        Create New Academic Note
      </h1>

      {message && (
        <div
          className={`p-3 rounded text-center ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g., Dijkstra's Algorithm: A Simple Explanation"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Course and Topic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Course</label>
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
            placeholder="e.g., CSE 4510"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            placeholder="e.g., Graph Theory"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Content (Markdown Editor Area) */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Content (Supports Markdown)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={15}
          placeholder="Start writing your note here using Markdown syntax for formatting..."
          className="w-full p-3 border border-gray-300 rounded-lg font-mono resize-y focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Preview Section (Optional, uncomment if installing ReactMarkdown) */}
      {/* <div>
        <label className="block text-gray-700 font-medium mb-1">Preview</label>
        <div className="border p-4 bg-gray-50 rounded-lg prose max-w-none">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
        </div>
      </div> */}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 disabled:bg-gray-400"
      >
        {loading ? "Publishing..." : "Publish Note"}
      </button>
    </form>
  );
}
