"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Upload, FileText, ChevronDown, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function UploadSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="flex justify-between items-center mb-8 border-b border-muted/20 pb-4">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-muted/20 rounded-xl"></div>
          <div className="h-4 w-40 bg-muted/20 rounded-md"></div>
        </div>
      </div>
      <div className="bg-card p-8 rounded-2xl border border-muted/10 h-[500px]"></div>
    </div>
  );
}

export default function UploadNotePage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

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
      setAuthChecking(false);
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
    if (visibility === "group" && groupId) {
      formData.append("group_id", groupId);
    }

    try {
      const res = await fetch("/api/uploadpdf", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error("Server did not return a valid response");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Upload failed");
      }

      // Success, redirect to note page
      router.push(`/notes/${data.id}`);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="w-full pb-10">
        <UploadSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 border-b border-muted/20 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-3">
            <Upload className="w-8 h-8 text-primary/70" />
            Upload PDF Note
          </h1>
          <p className="text-primary/60 mt-2 text-sm max-w-2xl">
            Upload your lecture notes, slides, or reading materials to process and organize them.
          </p>
        </div>
        <Link
          href="/notes"
          className="self-start flex items-center gap-2 py-2 px-4 bg-muted/10 text-primary font-medium rounded-xl hover:bg-muted/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> All Notes
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-subtle border border-muted/20">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {pdfUrl ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-green-50 rounded-2xl border border-green-200">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Upload Successful!</h3>
                <p className="text-green-700/80 mb-8 max-w-sm">
                  Your document has been processed and is ready to view.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setPdfUrl(null);
                      setFile(null);
                      setTitle("");
                      setCourse("");
                      setTopic("");
                    }}
                    className="px-6 py-2.5 bg-card text-green-700 font-medium rounded-xl border border-green-200 hover:bg-green-50 transition-all shadow-sm"
                  >
                    Upload Another
                  </button>
                  <Link
                    href="/notes"
                    className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all shadow-sm flex items-center gap-2"
                  >
                    Go to My Notes
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Upload Area */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Document *</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${file ? "border-accent bg-accent/5" : "border-muted/30 bg-background/50 hover:border-primary/30 hover:bg-muted/5"
                      }`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${file ? "bg-accent/20 text-accent-foreground" : "bg-muted/10 text-primary/40"
                        }`}>
                        <FileText className="w-6 h-6" />
                      </div>
                      {file ? (
                        <>
                          <p className="font-semibold text-primary">{file.name}</p>
                          <p className="text-xs text-primary/60 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF</p>
                          <p className="text-sm font-medium text-accent hover:underline mt-4 cursor-pointer relative z-20" onClick={(e) => {
                            e.preventDefault();
                            setFile(null);
                          }}>
                            Remove file
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-primary">Click to upload or drag and drop</p>
                          <p className="text-xs text-primary/50 mt-2">PDF (max. 10MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Title *</label>
                    <input
                      className="w-full border border-muted/40 bg-background/50 rounded-xl px-4 py-2.5 text-primary placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                      placeholder="e.g. Linear Algebra – Lecture 3"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Course <span className="text-primary/40 normal-case tracking-normal">(Optional)</span></label>
                    <input
                      className="w-full border border-muted/40 bg-background/50 rounded-xl px-4 py-2.5 text-primary placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                      placeholder="e.g. Math 201"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Topic <span className="text-primary/40 normal-case tracking-normal">(Optional)</span></label>
                    <input
                      className="w-full border border-muted/40 bg-background/50 rounded-xl px-4 py-2.5 text-primary placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                      placeholder="e.g. Eigenvalues"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Visibility</label>
                    <div className="relative">
                      <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="w-full border border-muted/40 bg-background/50 rounded-xl px-4 py-2.5 text-primary focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all appearance-none pr-10"
                      >
                        <option value="public">Public (Everyone can see)</option>
                        <option value="private">Private (Only you can see)</option>
                        <option value="group">Group (Only members can see)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50 pointer-events-none" />
                    </div>
                  </div>

                  {visibility === "group" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Select Group</label>
                      <div className="relative">
                        <select
                          value={groupId}
                          onChange={(e) => setGroupId(e.target.value)}
                          required={visibility === "group"}
                          className="w-full border border-muted/40 bg-background/50 rounded-xl px-4 py-2.5 text-primary focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all appearance-none pr-10"
                        >
                          <option value="">-- Choose a Group --</option>
                          {userGroups.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={loading || !file || !title || (visibility === 'group' && !groupId)}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:hover:bg-primary flex items-center justify-center min-w-[140px]"
                  >
                    {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Upload Document"}
                  </button>

                  <button
                    onClick={() => router.push("/notes")}
                    className="px-6 py-3 bg-muted/10 hover:bg-muted/20 text-primary font-medium rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 border-l-0 lg:border-l border-muted/20 pl-0 lg:pl-8 space-y-6">
          <div className="bg-muted/5 p-6 rounded-2xl border border-muted/20 mt-1">
            <h3 className="font-bold text-primary mb-3">Upload Guidelines</h3>
            <ul className="space-y-3 text-sm text-primary/70">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                Ensure your PDF text is selectable (not scanned images) for best processing results.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                Max file size is 10MB.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                Use descriptive titles to make your notes easier to search later.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


