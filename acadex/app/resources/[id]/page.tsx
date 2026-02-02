// app/resources/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ResourceComments from "@/components/ResourceComments";
import Link from "next/link";

interface ResourcePageProps {
    params: {
        id: string;
    };
}

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

export default function ResourcePage(props: ResourcePageProps) {
    const [resource, setResource] = useState<Resource | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    // Extract resource ID from params
    const resourceId = parseInt(props.params.id, 10);

    useEffect(() => {
        async function fetchResource() {
            // Check authentication
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            if (isNaN(resourceId)) {
                setError("Invalid resource ID");
                setLoading(false);
                return;
            }

            // Fetch resource details
            const { data: resourceData, error: fetchError } = await supabase
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
                .eq("id", resourceId)
                .single();

            if (fetchError) {
                console.error("Fetch Error:", fetchError);
                setError("Resource not found or you do not have permission to view it.");
            } else {
                setResource(resourceData as Resource);
            }

            setLoading(false);
        }

        fetchResource();
    }, [resourceId, supabase, router]);

    const getUsername = (resource: Resource): string => {
        if (Array.isArray(resource.profiles)) {
            return resource.profiles[0]?.username || "Unknown User";
        }
        return resource.profiles?.username || "Unknown User";
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading Resource...</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600 font-semibold">{error}</div>
        );
    }

    if (!resource) {
        return (
            <div className="p-8 text-center text-red-600">
                Resource data could not be retrieved.
            </div>
        );
    }

    const isPdf = resource.mime_type === "application/pdf";
    const isImage = resource.mime_type?.startsWith("image/");

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <Link
                    href="/resources"
                    className="inline-block mb-4 text-blue-600 hover:text-blue-800"
                >
                    ← Back to Resources
                </Link>

                {/* Resource Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h1 className="text-4xl font-extrabold mb-2 text-gray-900">
                        {resource.filename}
                    </h1>

                    <div className="text-lg text-gray-600 border-b pb-4">
                        <p>
                            Uploaded by{" "}
                            <span className="font-semibold text-blue-600">
                                {getUsername(resource)}
                            </span>
                        </p>
                        <p className="text-sm mt-1">
                            {new Date(resource.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm mt-1">
                            <span className="font-semibold">Type:</span> {resource.mime_type}
                        </p>
                        <p className="text-sm mt-1">
                            <span className="font-semibold">Size:</span>{" "}
                            {formatFileSize(resource.size)}
                        </p>
                    </div>

                    {/* Download Button */}
                    <div className="mt-4">
                        <a
                            href={resource.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Download / Open File
                        </a>
                    </div>
                </div>

                {/* File Preview */}
                {isPdf && (
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                        <h2 className="text-xl font-bold mb-3">Preview</h2>
                        <iframe
                            src={resource.file_path}
                            className="w-full h-[600px] border rounded"
                            title="PDF Viewer"
                        />
                    </div>
                )}

                {isImage && (
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                        <h2 className="text-xl font-bold mb-3">Preview</h2>
                        <img
                            src={resource.file_path}
                            alt={resource.filename}
                            className="w-full rounded"
                        />
                    </div>
                )}

                {/* Comments Section */}
                <ResourceComments resourceId={resourceId} />
            </div>
        </div>
    );
}
