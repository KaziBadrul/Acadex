"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NoteRequest {
    id: number;
    topic: string;
    course: string;
    description: string;
    status: string;
    requester_id: string;
    created_at: string;
    profiles: { username: string } | { username: string }[] | null;
}

export default function NoteRequestsPage() {
    const [requests, setRequests] = useState<NoteRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [filter, setFilter] = useState<"all" | "mine">("all");
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: number | null }>({
        show: false,
        id: null,
    });

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchRequests();
        checkUser();
    }, []);

    const checkUser = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) setUser({ id: user.id });
    };

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("note_requests")
            .select(`
        *,
        profiles:requester_id (username)
      `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching requests:", error);
        } else {
            setRequests((data as any) || []);
        }
        setLoading(false);
    };

    const deleteRequest = async (id: number) => {
        console.log("Attempting to delete request:", id);
        const { error } = await supabase.from("note_requests").delete().eq("id", id);

        if (error) {
            console.error("Delete error:", error);
        } else {
            console.log("Request deleted successfully");
            setRequests((prev) => prev.filter((r) => r.id !== id));
        }
    };

    const getUsername = (req: NoteRequest) => {
        if (Array.isArray(req.profiles)) return req.profiles[0]?.username;
        return req.profiles?.username || "Unknown";
    };

    const filteredRequests =
        filter === "mine" && user
            ? requests.filter((r) => r.requester_id === user.id)
            : requests;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            📝 Note Requests
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Ask for help or contribute to the community!
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/requests/create"
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                            + Create Request
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === "all"
                            ? "bg-white border-2 border-blue-500 text-blue-600 shadow-sm"
                            : "bg-white text-gray-500 hover:bg-gray-100 border border-transparent"
                            }`}
                    >
                        All Pending Requests
                    </button>
                    <button
                        onClick={() => setFilter("mine")}
                        className={`px-4 py-2 rounded-lg font-medium transition ${filter === "mine"
                            ? "bg-white border-2 border-blue-500 text-blue-600 shadow-sm"
                            : "bg-white text-gray-500 hover:bg-gray-100 border border-transparent"
                            }`}
                    >
                        My Requests
                    </button>
                </div>

                {/* List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow border border-dashed border-gray-300">
                        <p className="text-xl text-gray-500 font-medium">
                            No requests found.
                        </p>
                        <Link
                            href="/requests/create"
                            className="mt-4 inline-block text-blue-600 hover:underline"
                        >
                            Create the first one!
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredRequests.map((req) => (
                            <div
                                key={req.id}
                                className="bg-white p-5 rounded-xl shadow hover:shadow-md transition border border-gray-100 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase rounded">
                                            {req.course}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {req.topic}
                                    </h3>
                                    {req.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {req.description}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 border-t flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                                        Requested by{" "}
                                        <span className="font-semibold text-gray-800">
                                            {getUsername(req)}
                                        </span>
                                    </div>

                                    {user?.id === req.requester_id ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setDeleteModal({ show: true, id: req.id });
                                            }}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium z-10 relative"
                                        >
                                            Delete
                                        </button>
                                    ) : (
                                        <Link
                                            href={`/notes/upload?course=${encodeURIComponent(
                                                req.course
                                            )}&topic=${encodeURIComponent(req.topic)}`}
                                            className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition"
                                        >
                                            Fulfill Request
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Confirm Deletion
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this request? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteModal({ show: false, id: null })}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (deleteModal.id) deleteRequest(deleteModal.id);
                                        setDeleteModal({ show: false, id: null });
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
