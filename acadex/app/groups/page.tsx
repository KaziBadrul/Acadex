"use client";

import { useState, useEffect, Suspense } from "react";
import { createGroup, joinGroup, fetchUserGroups } from "./actions";
import { useRouter } from "next/navigation";
import { Users, Plus, Key, LogIn, MessageSquare, BookOpen, Crown, User } from "lucide-react";

function GroupsSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-muted/20 rounded-xl mb-8"></div>
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-card p-6 rounded-2xl border border-muted/10 h-64"></div>
        <div className="bg-card p-6 rounded-2xl border border-muted/10 h-64"></div>
      </div>
      <div className="h-8 w-40 bg-muted/20 rounded-xl mb-6"></div>
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-card h-48 rounded-2xl border border-muted/10"></div>
        ))}
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinPass, setJoinPass] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const router = useRouter();

  async function loadGroups() {
    setLoading(true);
    const data = await fetchUserGroups();
    setGroups(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    const res = await createGroup(name, password);
    if (res.error) setError(res.error);
    else {
      setName("");
      setPassword("");
      loadGroups();
    }
    setCreating(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setJoining(true);
    const res = await joinGroup(inviteCode, joinPass);
    if (res.error) setError(res.error);
    else {
      setInviteCode("");
      setJoinPass("");
      loadGroups();
    }
    setJoining(false);
  };

  if (loading) {
    return (
      <div className="w-full pb-10">
        <GroupsSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full pb-10">
      <div className="flex justify-between items-center mb-8 border-b border-muted/20 pb-4">
        <h1 className="text-3xl font-bold text-primary tracking-tight">
          Manage Your Groups
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Create Group */}
        <div className="bg-card p-6 md:p-8 rounded-2xl shadow-subtle border border-muted/20">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Plus className="w-6 h-6" />
            <h2 className="text-xl font-bold tracking-tight">Create a Group</h2>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Group Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Calculus 101"
                className="w-full border border-muted/40 bg-background/50 rounded-xl px-4 py-2.5 text-primary placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Password <span className="text-primary/40 normal-case tracking-normal">(Optional)</span></label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank for open group"
                  type="password"
                  className="w-full border border-muted/40 bg-background/50 rounded-xl pl-9 pr-4 py-2.5 text-primary placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl shadow-sm transition-all disabled:opacity-50 flex justify-center items-center mt-2"
            >
              {creating ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Group"}
            </button>
          </form>
        </div>

        {/* Join Group */}
        <div className="bg-card p-6 md:p-8 rounded-2xl shadow-subtle border border-muted/20">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <LogIn className="w-6 h-6" />
            <h2 className="text-xl font-bold tracking-tight">Join a Group</h2>
          </div>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Invite Code</label>
              <input
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="8-character code"
                className="w-full border border-muted/40 bg-background/50 rounded-xl px-4 py-2.5 text-primary font-mono placeholder:text-muted placeholder:font-sans focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-primary/60 uppercase tracking-wider">Password <span className="text-primary/40 normal-case tracking-normal">(If required)</span></label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input
                  value={joinPass}
                  onChange={(e) => setJoinPass(e.target.value)}
                  placeholder="Group password"
                  type="password"
                  className="w-full border border-muted/40 bg-background/50 rounded-xl pl-9 pr-4 py-2.5 text-primary placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={joining}
              className="w-full bg-accent hover:bg-accent/90 text-primary font-medium py-3 rounded-xl shadow-sm transition-all disabled:opacity-50 flex justify-center items-center mt-2"
            >
              {joining ? <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : "Join Group"}
            </button>
          </form>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-primary tracking-tight">Your Groups</h2>
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-2xl border border-muted/20 border-dashed">
            <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mb-4 text-primary/40">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">No groups yet</h3>
            <p className="text-primary/60 text-sm max-w-sm">
              You haven&apos;t joined any groups. Create a new group above or enter an invite code to join an existing one.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((g) => (
              <div
                key={g.id}
                className="bg-card rounded-2xl border border-muted/20 shadow-subtle flex flex-col justify-between overflow-hidden hover:border-muted/40 transition-colors"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-primary tracking-tight leading-tight line-clamp-1 pr-4">
                      {g.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs bg-muted/10 text-primary/70 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                      <Users className="w-3 h-3" />
                      {g.group_members?.length || 0}
                    </div>
                  </div>
                  <p className="text-sm text-primary/60 mb-5 flex items-center gap-2">
                    Code:{" "}
                    <span className="font-mono text-xs font-bold text-primary bg-accent/30 px-2 py-1 rounded-md">
                      {g.invite_code}
                    </span>
                  </p>

                  <div className="mb-2">
                    <h4 className="text-[10px] font-bold uppercase text-primary/40 tracking-wider mb-2">
                      Members
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {g.group_members?.slice(0, 5).map((m: any) => (
                        <span
                          key={m.user_id}
                          className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border font-medium ${m.role === "admin"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-muted/20 bg-muted/5 text-primary/70"
                            }`}
                          title={m.role === "admin" ? "Admin" : "Member"}
                        >
                          {m.role === "admin" ? <Crown className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                          <span className="truncate max-w-[80px]">{m.profiles?.username || "Unknown"}</span>
                        </span>
                      ))}
                      {g.group_members?.length > 5 && (
                        <span className="text-[11px] px-2 py-1 rounded-md border border-muted/20 bg-muted/5 text-primary/70 font-medium">
                          +{g.group_members.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-muted/10 divide-x divide-muted/10">
                  <button
                    onClick={() => router.push(`/groups/${g.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-muted/5 hover:bg-muted/10 text-primary text-sm font-medium py-3.5 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Room
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard?group=${g.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-muted/5 hover:bg-muted/10 text-primary text-sm font-medium py-3.5 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" /> Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


