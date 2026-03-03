"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Key, ArrowLeft, Hash } from "lucide-react";
import { joinGroup } from "@/app/groups/actions";

function JoinGroupForm() {
    const searchParams = useSearchParams();
    const [inviteCode, setInviteCode] = useState(searchParams.get("code") || "");
    const [joinPass, setJoinPass] = useState("");
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setJoining(true);
        setError(null);
        const res = await joinGroup(inviteCode, joinPass || undefined);
        setJoining(false);
        if (res.error) {
            setError(res.error);
        } else {
            router.push("/groups");
        }
    };

    return (
        <div className="max-w-lg mx-auto py-10 px-4">
            {/* Back */}
            <Link
                href="/groups"
                className="inline-flex items-center gap-2 text-sm text-primary/60 hover:text-primary mb-8 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Groups
            </Link>

            {/* Card */}
            <div className="bg-card rounded-2xl border border-muted/20 shadow-subtle overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-muted/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                        <LogIn className="w-5 h-5 text-primary/70" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-primary tracking-tight">Join a Group</h1>
                        <p className="text-xs text-primary/50 mt-0.5">Enter an invite code to join an existing study group</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleJoin} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">
                            Invite Code <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                            <input
                                required
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                placeholder="8-CHARACTER CODE"
                                maxLength={8}
                                className="w-full border border-muted/40 bg-background/50 rounded-xl pl-9 pr-4 py-2.5 text-primary font-mono tracking-widest placeholder:text-muted placeholder:font-sans placeholder:tracking-normal focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                            />
                        </div>
                        <p className="text-xs text-primary/40">Ask the group admin for the invite code.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">
                            Password <span className="text-primary/40 normal-case font-normal tracking-normal">(If required)</span>
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                            <input
                                value={joinPass}
                                onChange={(e) => setJoinPass(e.target.value)}
                                placeholder="Leave blank if the group has no password"
                                type="password"
                                className="w-full border border-muted/40 bg-background/50 rounded-xl pl-9 pr-4 py-2.5 text-primary placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Link
                            href="/groups"
                            className="flex-1 text-center py-2.5 border border-muted/30 text-primary/70 text-sm font-medium rounded-xl hover:bg-muted/10 transition-all"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={joining}
                            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 text-primary text-sm font-semibold py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
                        >
                            {joining ? (
                                <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                                <><LogIn className="w-4 h-4" /> Join Group</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function JoinGroupPage() {
    return (
        <Suspense fallback={<div className="max-w-lg mx-auto py-10 px-4 text-primary/40 text-sm">Loading...</div>}>
            <JoinGroupForm />
        </Suspense>
    );
}
