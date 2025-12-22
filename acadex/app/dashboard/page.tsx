// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

// Define types for cleaner code
interface Note {
  id: number;
  title: string;
  content: string;
  course: string;
  topic: string;
  created_at: string;
  author_id: string;
}

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string, username: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // If not logged in, redirect to login
        router.push('/login');
        return;
      }
      
      // 1. Fetch User Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      setUser({ id: user.id, username: profile?.username || 'User' });
      
      // 2. Fetch ALL Notes (that the user has RLS permission to view)
      const { data: allNotes, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
      } else if (allNotes) {
        setNotes(allNotes as Note[]);
      }
      
      setLoading(false);
    }

    fetchData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="p-12 text-center text-lg">Loading Dashboard...</div>;
  }
  
  if (!user) {
      // Should be unreachable due to redirect above, but for safety
      return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome, <span className="text-blue-600">{user.username}!</span>
          </h1>
          <button 
            onClick={handleLogout}
            className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300"
          >
            Log Out
          </button>
        </div>

        {/* --- Quick Stats and Actions --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Total Available Notes</p>
            <p className="text-4xl font-extrabold text-gray-900 mt-1">{notes.length}</p>
            <div className='flex flex-col'>
              <Link href="/notes/create" className="mt-4 inline-block text-blue-500 hover:text-blue-700 text-sm font-medium">
              ➕ Create New Note
            </Link>
            <Link href="/notes/upload" className="mt-4 inline-block text-blue-500 hover:text-blue-700 text-sm font-medium">
              📥 Upload New Note
            </Link>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-500">Quick Actions</p>
            <div className="mt-2 space-y-2">
                <Link href="/schedule" className="block text-green-500 hover:underline">🗓️ View Schedule</Link>
                <Link href="/resources" className="block text-green-500 hover:underline">📚 Resource Repository</Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-500">User ID</p>
            <p className="text-md font-mono text-gray-700 mt-1 truncate">{user.id}</p>
            <p className="text-xs text-gray-400 mt-2">Manage your profile settings.</p>
          </div>
        </div>

        {/* --- Notes List --- */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">All Available Notes</h2>
        
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`} className="block">
                <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition duration-150 ease-in-out">
                  <h3 className="text-xl font-bold text-blue-600">{note.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    **Course:** {note.course} | **Topic:** {note.topic} | **Created:** {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500 bg-white rounded-lg shadow">
            No notes found. Create the first one! 📝
          </div>
        )}

      </div>
    </div>
  );
}