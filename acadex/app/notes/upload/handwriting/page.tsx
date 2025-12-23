"use client";

import { useState } from "react";

export default function Handwriting() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setText("");
    setLoading(true);

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      setLoading(false);
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/ocrcloudinary", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setText(data?.error ?? "OCR failed");
      } else {
        setText(data?.text ?? "");
        console.log("OCR RAW:", data.ocr);
      }
    } catch (err) {
      setText("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-xl bg-white p-10 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4 text-center">
          Handwriting → Text
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Upload a handwritten note or screenshot to extract text.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            name="file"
            type="file"
            accept="image/*"
            className="w-full text-sm text-gray-700
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 text-white font-semibold rounded-lg shadow-md transition duration-300
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
          >
            {loading ? "Extracting…" : "Extract Text"}
          </button>
        </form>

        {text && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Extracted Text
            </h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {text}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
