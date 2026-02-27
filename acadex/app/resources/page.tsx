// app/resources/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Resource {
    id: number;
    filename: string;
    file_path: string;
    mime_type: string;
    size: number;
    created_at: string;
    uploader_id: string;
    profiles: { username: string } | { username: string }[] | null;
}

export default function ResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<string>("all");

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function fetchResources() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            const { data: resourcesData, error } = await supabase
                .from("resources")
                .select(
                    `
          id,
          filename,
          file_path,
          mime_type,
          size,
          created_at,
          uploader_id,
          profiles:uploader_id (
            username
          )
        `
                )
                .order("created_at", { ascending: false });

            if (!error && resourcesData) {
                setResources(resourcesData as Resource[]);
            }

            setLoading(false);
        }

        fetchResources();
    }, [router, supabase]);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    const getUsername = (resource: Resource): string => {
        if (Array.isArray(resource.profiles)) {
            return resource.profiles[0]?.username || "Unknown User";
        }
        return resource.profiles?.username || "Unknown User";
    };

    const getFileType = (mimeType: string): string => {
        if (mimeType.startsWith("image/")) return "image";
        if (mimeType === "application/pdf") return "pdf";
        if (mimeType.startsWith("video/")) return "video";
        if (mimeType.startsWith("audio/")) return "audio";
        return "other";
    };

    // Filter resources
    const filteredResources = resources.filter((resource) => {
        const fileType = getFileType(resource.mime_type);

        if (filterType !== "all" && fileType !== filterType) {
            return false;
        }

        if (search.trim()) {
            const query = search.toLowerCase();
            const haystack = `${resource.filename}`.toLowerCase();
            if (!haystack.includes(query)) return false;
        }

        return true;
    });

    // Count by type
    const typeCounts = {
        all: resources.length,
        pdf: resources.filter((r) => getFileType(r.mime_type) === "pdf").length,
        image: resources.filter((r) => getFileType(r.mime_type) === "image").length,
        video: resources.filter((r) => getFileType(r.mime_type) === "video").length,
        other: resources.filter((r) => !["pdf", "image", "video"].includes(getFileType(r.mime_type))).length,
    };

    if (loading) {
        return <div className="p-12 text-center text-lg">Loading Resources...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-4xl font-bold text-gray-900">
                        📚 Resource Repository
                    </h1>
                    <div className="flex gap-3">
                        <Link
                            href="/resources/upload"
                            className="py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition"
                        >
                            📤 Upload Resource
                        </Link>
                        <Link
                            href="/dashboard"
                            className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilterType("all")}
                            className={`px-3 py-1 text-sm font-semibold rounded border ${filterType === "all"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            All ({typeCounts.all})
                        </button>
                        <button
                            onClick={() => setFilterType("pdf")}
                            className={`px-3 py-1 text-sm font-semibold rounded border ${filterType === "pdf"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            PDFs ({typeCounts.pdf})
                        </button>
                        <button
                            onClick={() => setFilterType("image")}
                            className={`px-3 py-1 text-sm font-semibold rounded border ${filterType === "image"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            Images ({typeCounts.image})
                        </button>
                        <button
                            onClick={() => setFilterType("video")}
                            className={`px-3 py-1 text-sm font-semibold rounded border ${filterType === "video"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            Videos ({typeCounts.video})
                        </button>
                        <button
                            onClick={() => setFilterType("other")}
                            className={`px-3 py-1 text-sm font-semibold rounded border ${filterType === "other"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            Other ({typeCounts.other})
                        </button>
                    </div>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by filename..."
                        className="w-full md:w-80 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Resources List */}
                {filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredResources.map((resource) => {
                            const fileType = getFileType(resource.mime_type);
                            const typeIcon = {
                                pdf: "📄",
                                image: "🖼️",
                                video: "🎥",
                                audio: "🎵",
                                other: "📎",
                            }[fileType] || "📎";

                            return (
                                <Link
                                    key={resource.id}
                                    href={`/resources/${resource.id}`}
                                    className="block"
                                >
                                    <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition h-full">
                                        <div className="flex items-start gap-3">
                                            <span className="text-3xl">{typeIcon}</span>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-blue-600 truncate">
                                                    {resource.filename}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    By {getUsername(resource)}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatFileSize(resource.size)} •{" "}
                                                    {new Date(resource.created_at).toLocaleDateString()}
                                                </p>
                                                <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded">
                                                    {fileType.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-10 text-center text-gray-500 bg-white rounded-lg shadow">
                        No resources match your filter or search.
                    </div>
                )}
            </div>
        </div>
    );
}
