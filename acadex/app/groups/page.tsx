"use client";

import { useState, useEffect } from "react";
import { createGroup, joinGroup, fetchUserGroups } from "./actions";
import { useRouter } from "next/navigation";

export default function GroupsPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinPass, setJoinPass] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const data = await fetchUserGroups();
    setGroups(data);
    setLoading(false);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await createGroup(name, password);
    if (res.error) setError(res.error);
    else {
      setName("");
      setPassword("");
      loadGroups();
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await joinGroup(inviteCode, joinPass);
    if (res.error) setError(res.error);
    else {
      setInviteCode("");
      setJoinPass("");
      loadGroups();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Manage Your Groups
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Group */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Create a Group</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group Name (e.g. Calculus 101)"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (Optional)"
                type="password"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create Group
              </button>
            </form>
          </div>

          {/* Join Group */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Join a Group</h2>
            <form onSubmit={handleJoin} className="space-y-4">
              <input
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Invite Code (8 chars)"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={joinPass}
                onChange={(e) => setJoinPass(e.target.value)}
                placeholder="Password (if any)"
                type="password"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition"
              >
                Join Group
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Groups</h2>
          {loading ? (
            <p>Loading...</p>
          ) : groups.length === 0 ? (
            <p className="text-gray-500 italic">
              You haven't joined any groups yet.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-blue-700">
                        {g.name}
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold">
                        {g.group_members?.length || 0} Members
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Invite Code:{" "}
                      <span className="font-mono font-bold text-gray-800 bg-gray-50 px-2 py-1 rounded">
                        {g.invite_code}
                      </span>
                    </p>

                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                        Members
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {g.group_members?.map((m: any) => (
                          <span
                            key={m.user_id}
                            className={`text-xs px-2 py-1 rounded-md border ${m.role === "admin"
                                ? "border-yellow-300 bg-yellow-50 text-yellow-700"
                                : "border-blue-100 bg-blue-50 text-blue-700"
                              }`}
                            title={m.role === "admin" ? "Admin" : "Member"}
                          >
                            {m.profiles?.username || "Unknown"}
                            {m.role === "admin" && " 👑"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/groups/${g.id}`)}
                      className="flex-1 bg-blue-600 text-white text-sm font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                      Enter Study Room 💬
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard?group=${g.id}`)}
                      className="flex-1 bg-gray-900 text-white text-sm font-bold py-3 rounded-lg hover:bg-black transition shadow-sm"
                    >
                      Group Notes 📝
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
