"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function UploadResourcePage() {
    const supabase = createClient();
    const router = useRouter();

    const [user, setUser] = useState<{ id: string } | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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
        }

        checkAuth();
    }, [router, supabase]);

    const handleUpload = async () => {
        if (!user) {
            setError("User not authenticated");
            return;
        }
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        setError(null);
        setLoading(true);
        setSuccess(false);

        try {
            // Create unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name}`;
            const filePath = `resources/${user.id}/${filename}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("resources")
                .upload(filePath, file, {
                    contentType: file.type,
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            // Get public URL
            const {
                data: { publicUrl },
            } = supabase.storage.from("resources").getPublicUrl(filePath);

            // Insert into resources table
            const { error: dbError } = await supabase.from("resources").insert({
                filename: file.name,
                file_path: publicUrl,
                mime_type: file.type,
                size: file.size,
                uploader_id: user.id,
            });

            if (dbError) {
                throw new Error(dbError.message);
            }

            setSuccess(true);
            setFile(null);

            // Redirect to resources page after 2 seconds
            setTimeout(() => {
                router.push("/resources");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Upload failed");
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
                        📤 Upload Resource
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Upload any file (PDF, image, video, etc.) to share with others.
                    </p>
                </div>

                {/* Upload Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select File *
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                        />
                        {file && (
                            <div className="mt-2 text-sm text-gray-600">
                                <p>
                                    <span className="font-semibold">File:</span> {file.name}
                                </p>
                                <p>
                                    <span className="font-semibold">Size:</span>{" "}
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <p>
                                    <span className="font-semibold">Type:</span> {file.type}
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                            ❌ {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-green-600 text-sm bg-green-50 p-3 rounded border border-green-200">
                            ✅ Resource uploaded successfully! Redirecting...
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleUpload}
                            disabled={loading || !file}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Uploading…" : "Upload Resource"}
                        </button>

                        <button
                            onClick={() => router.push("/resources")}
                            className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                        📝 Supported File Types
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• PDFs - Documents, textbooks, papers</li>
                        <li>• Images - PNG, JPG, GIF, etc.</li>
                        <li>• Videos - MP4, WebM, etc.</li>
                        <li>• Audio - MP3, WAV, etc.</li>
                        <li>• Any other file type</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
