"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function UploadNotePage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<{ id: string } | null>(null);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [groupId, setGroupId] = useState("");
  const [userGroups, setUserGroups] = useState<any[]>([]);

  // 🔐 Auth check
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser({ id: user.id });

      // Fetch user groups
      const { data: memberships } = await supabase
        .from("group_members")
        .select("groups(id, name)")
        .eq("user_id", user.id);

      if (memberships) {
        setUserGroups(memberships.map((m: any) => m.groups));
      }
    }

    checkAuth();
  }, [router, supabase]);

  const handleUpload = async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }
    if (!file || !title) {
      setError("Title and PDF file are required.");
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("course", course);
    formData.append("topic", topic);
    formData.append("author_id", user.id);
    formData.append("visibility", visibility);
    formData.append("group_id", groupId);

    try {
      const res = await fetch("/api/uploadpdf", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error("Server did not return JSON");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Upload failed");
      }

      setPdfUrl(data.url);

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setPdfUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-12 text-center text-lg">Checking authentication…</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <h1 className="text-4xl font-bold text-gray-900">
            📥 Upload New PDF Note
          </h1>
          <p className="text-gray-500 mt-2">
            Upload a PDF and organize it by course and topic.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-5 text-black">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Linear Algebra – Lecture 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-black">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <input
                className="w-full border rounded-lg p-2"
                placeholder="e.g. Math 201"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic
              </label>
              <input
                className="w-full border rounded-lg p-2"
                placeholder="e.g. Eigenvalues"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full border rounded-lg p-2 bg-white"
              >
                <option value="public">Public (Everyone can see)</option>
                <option value="private">Private (Only you can see)</option>
                <option value="group">Group (Only members can see)</option>
              </select>
            </div>
            {visibility === "group" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Group
                </label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  required={visibility === "group"}
                  className="w-full border rounded-lg p-2 bg-white"
                >
                  <option value="">-- Choose a Group --</option>
                  {userGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PDF File *
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
            >
              {loading ? "Uploading…" : "Upload PDF"}
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Preview */}
        {pdfUrl && (
          <div className="mt-10 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              📄 Uploaded PDF Preview
            </h2>
            <iframe src={pdfUrl} className="w-full h-[700px] border rounded" />
          </div>
        )}
      </div>
    </div>
  );
}
