"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Key, ArrowLeft, Users } from "lucide-react";
import { createGroup } from "@/app/groups/actions";

export default function CreateGroupPage() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError(null);
        const res = await createGroup(name, password || undefined);
        setCreating(false);
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
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary/70" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-primary tracking-tight">Create a Group</h1>
                        <p className="text-xs text-primary/50 mt-0.5">Start a new study group and invite classmates</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleCreate} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">
                            Group Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Calculus 101, BIO Study Circle"
                            className="w-full border border-muted/40 bg-background/50 rounded-xl px-4 py-2.5 text-primary placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">
                            Password <span className="text-primary/40 normal-case font-normal tracking-normal">(Optional — leave blank for an open group)</span>
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Set a password to restrict access"
                                type="password"
                                className="w-full border border-muted/40 bg-background/50 rounded-xl pl-9 pr-4 py-2.5 text-primary placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                            />
                        </div>
                        <p className="text-xs text-primary/40">
                            A unique 8-character invite code will be generated automatically.
                        </p>
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
                            disabled={creating}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background text-sm font-semibold py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
                        >
                            {creating ? (
                                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                            ) : (
                                <><Plus className="w-4 h-4" /> Create Group</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
