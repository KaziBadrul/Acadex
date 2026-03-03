"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchUserGroups, fetchAllGroups } from "./actions";
import { useRouter } from "next/navigation";
import { Users, Plus, LogIn, MessageSquare, BookOpen, Crown, User, Search, Globe, Shield } from "lucide-react";

interface GroupMember {
  user_id: string;
  role: string;
  profiles: {
    username: string;
  };
}

interface Group {
  id: string;
  name: string;
  invite_code: string;
  creator_id: string;
  created_at?: string;
  member_count?: number;
  hasPassword?: boolean;
  group_members?: GroupMember[];
}

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
  const [groups, setGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"my" | "discover">("my");

  const router = useRouter();

  async function loadGroups() {
    setLoading(true);
    const [userData, allData] = await Promise.all([
      fetchUserGroups(),
      fetchAllGroups()
    ]);
    setGroups((userData as Group[]) || []);
    setAllGroups((allData as Group[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    loadGroups();
  }, []);

  const filteredMyGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDiscoverGroups = (allGroups || []).filter(g => {
    const isMember = groups.some(mg => mg.id === g.id);
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
    return !isMember && matchesSearch;
  });

  if (loading) {
    return (
      <div className="w-full pb-10">
        <GroupsSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-muted/20 pb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary tracking-tight">
          Study Groups
        </h1>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search groups by name..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent shadow-sm text-sm"
          />
        </div>
      </div>



      {/* Tabs */}
      <div className="flex gap-2 mb-8 p-1 bg-muted/10 w-fit rounded-xl border border-muted/10">
        <button
          onClick={() => setActiveTab("my")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "my"
            ? "bg-card text-primary shadow-sm"
            : "text-primary/60 hover:text-primary hover:bg-muted/5"
            }`}
        >
          <Users className="w-4 h-4" /> My Groups ({groups.length})
        </button>
        <button
          onClick={() => setActiveTab("discover")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "discover"
            ? "bg-card text-primary shadow-sm"
            : "text-primary/60 hover:text-primary hover:bg-muted/5"
            }`}
        >
          <Globe className="w-4 h-4" /> Discover ({filteredDiscoverGroups.length})
        </button>
      </div>

      {activeTab === "my" ? (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link
              href="/groups/create"
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-background text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Create Group
            </Link>
            <Link
              href="/groups/join"
              className="flex items-center gap-2 bg-card border border-muted/30 hover:bg-muted/10 text-primary text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              <LogIn className="w-4 h-4" /> Join a Group
            </Link>
          </div>

          <div id="my-groups">
            <h2 className="text-2xl font-bold mb-6 text-primary tracking-tight">Your Groups</h2>
            {filteredMyGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-2xl border border-muted/20 border-dashed">
                <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mb-4 text-primary/40">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {searchTerm ? "No matching groups" : "No groups yet"}
                </h3>
                <p className="text-primary/60 text-sm max-w-sm">
                  {searchTerm
                    ? `We couldn't find any groups matching "${searchTerm}" in your list.`
                    : "You haven't joined any groups yet. Start by creating one or searching in the Discovery tab."
                  }
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMyGroups.map((g) => (
                  <GroupCard key={g.id} g={g} router={router} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div id="discover-groups">
          <h2 className="text-2xl font-bold mb-6 text-primary tracking-tight">Discover Communities</h2>
          {filteredDiscoverGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-2xl border border-muted/20 border-dashed">
              <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mb-4 text-primary/40">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">No new groups found</h3>
              <p className="text-primary/60 text-sm max-w-sm">
                {searchTerm
                  ? `No groups found matching "${searchTerm}".`
                  : "All available groups are already in your list!"
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDiscoverGroups.map((g) => (
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
                        {g.member_count}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-5">
                      {g.hasPassword ? (
                        <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold border border-red-100">
                          <Shield className="w-2.5 h-2.5" /> PRIVATE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold border border-green-100">
                          <Globe className="w-2.5 h-2.5" /> PUBLIC
                        </span>
                      )}
                      <span className="text-[10px] text-primary/40 font-medium bg-muted/5 px-2 py-0.5 rounded-full">
                        ID: {g.invite_code}
                      </span>
                    </div>

                    <p className="text-sm text-primary/60 line-clamp-2 italic mb-4">
                      Create a shared learning space for students and collaborators...
                    </p>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => router.push(`/groups/join?code=${g.invite_code}`)}
                      className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background text-sm font-semibold py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      <LogIn className="w-4 h-4" /> Ready to Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GroupCard({ g, router }: { g: Group, router: any }) {
  return (
    <div
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
            {g.group_members?.slice(0, 5).map((m: GroupMember) => (
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
            {g.group_members && g.group_members.length > 5 && (
              <span className="text-[11px] px-2 py-1 rounded-md border border-muted/20 bg-muted/5 text-primary/70 font-medium">
                +{g.group_members.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 space-y-2">
        <button
          onClick={() => router.push(`/groups/${g.id}`)}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background text-sm font-semibold py-3 rounded-xl transition-all shadow-sm"
        >
          <MessageSquare className="w-4 h-4" /> Enter Room
        </button>
        <button
          onClick={() => router.push(`/dashboard?group=${g.id}`)}
          className="w-full flex items-center justify-center gap-2 text-primary/60 hover:text-primary hover:bg-muted/10 text-sm font-medium py-2 rounded-xl transition-all"
        >
          <BookOpen className="w-4 h-4" /> View Group Notes
        </button>
      </div>
    </div>
  );
}
