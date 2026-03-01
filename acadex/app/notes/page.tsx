"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNotes } from "./actions";
import { FileText, Loader2, Search, ArrowRight, Clock, User, BookOpen } from "lucide-react";

export default function NotesPage() {
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadNotes() {
            setLoading(true);
            const res = await getNotes();
            if (res.notes) {
                setNotes(res.notes);
            }
            setLoading(false);
        }
        loadNotes();
    }, []);

    const filteredNotes = notes.filter((note) => {
        const query = searchQuery.toLowerCase();
        return (
            note.title?.toLowerCase().includes(query) ||
            note.course?.toLowerCase().includes(query) ||
            note.topic?.toLowerCase().includes(query)
        );
    });

    return (
        <main className="w-full pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-muted/20 pb-6 mb-8 mt-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary/70 shadow-sm">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-primary tracking-tight">Study Notes</h1>
                        <p className="text-primary/60 text-sm mt-1">
                            Browse, search, and discover notes across courses.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-muted/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-primary placeholder:text-muted transition-all shadow-sm"
                        />
                        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <Link
                        href="/notes/upload"
                        className="bg-primary text-white font-medium py-2.5 px-5 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 text-sm shadow-sm whitespace-nowrap shrink-0"
                    >
                        <span>Upload Note</span>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-card rounded-2xl p-6 border border-muted/20 shadow-subtle animate-pulse space-y-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="h-6 w-3/4 bg-muted/20 rounded-lg"></div>
                                <div className="w-8 h-8 rounded-full bg-muted/10"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-1/3 bg-muted/10 rounded-md"></div>
                                <div className="h-4 w-1/2 bg-muted/10 rounded-md"></div>
                            </div>
                            <div className="pt-4 mt-4 border-t border-muted/10 flex justify-between">
                                <div className="h-4 w-1/4 bg-muted/10 rounded-md"></div>
                                <div className="h-4 w-1/4 bg-muted/10 rounded-md"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className="bg-card rounded-2xl border border-muted/20 shadow-subtle flex flex-col items-center justify-center p-16 text-center max-w-2xl mx-auto mt-12">
                    <div className="w-20 h-20 rounded-full bg-muted/10 flex items-center justify-center mb-6 shadow-sm">
                        <FileText className="w-10 h-10 text-primary/30" />
                    </div>
                    <h2 className="text-xl font-bold text-primary tracking-tight mb-2">
                        {searchQuery ? "No Notes Found" : "No Notes Available"}
                    </h2>
                    <p className="text-primary/60 mb-8 max-w-md">
                        {searchQuery
                            ? "Try adjusting your search terms or filters to find what you're looking for."
                            : "Your repository is currently empty. Start building your knowledge base by uploading your first note."}
                    </p>

                    <Link
                        href="/notes/upload"
                        className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
                    >
                        Upload First Note <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map((note) => (
                        <Link
                            href={`/notes/${note.id}`}
                            key={note.id}
                            className="group bg-card rounded-2xl p-6 border border-muted/20 shadow-subtle hover:shadow-md hover:border-accent/40 transition-all duration-300 flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-4 gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-primary leading-tight group-hover:text-accent transition-colors line-clamp-2">
                                        {note.title || "Untitled Note"}
                                    </h3>
                                    {note.course && (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent font-semibold text-xs rounded-md mt-3 mb-1">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            {note.course}
                                        </div>
                                    )}
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/40 shrink-0 group-hover:bg-accent/10 group-hover:text-accent transition-colors shadow-sm">
                                    <FileText className="w-5 h-5" />
                                </div>
                            </div>

                            {note.topic && (
                                <p className="text-primary/70 text-sm line-clamp-2 mb-4 flex-1">
                                    <span className="font-semibold text-primary/50 text-xs uppercase tracking-wider block mb-1">Topic</span>
                                    {note.topic}
                                </p>
                            )}

                            {!note.topic && <div className="flex-1"></div>}

                            <div className="pt-4 mt-auto border-t border-muted/10 flex items-center justify-between text-xs text-primary/50 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 opacity-70" />
                                    <span className="truncate max-w-[100px]">{note.profiles?.username || "Unknown"}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 opacity-70" />
                                    <span>{new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}


