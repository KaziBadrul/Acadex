// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function Index() {
  const [session, setSession] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(!!session);
      setLoading(false);
    };

    checkSession();
    
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(!!session);
        // auto redr to the dashboard if a user logs in
        if (event === 'SIGNED_IN') {
            router.push('/dashboard');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);
  
  if (loading) {
    return <div className="p-12 text-center text-lg">Loading authentication state...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-lg bg-white p-10 rounded-xl shadow-2xl">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-4">Acadex Platform</h1>
        <p className="text-xl text-gray-600 mb-8">
          {session 
            ? `You are logged in.` 
            : `Your unified workspace for notes and resources.`}
        </p>

        <div className="space-y-4">
          {session ? (
            <Link 
              href="/dashboard"
              className="w-full inline-block py-3 px-6 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="w-full inline-block py-3 px-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
            >
              Log In to Get Started
            </Link>
          )}
          
          <p className="text-sm text-gray-500 pt-4">
            {session ? 'Welcome back! View your recent activity.' : 'New user? Sign up here.'}
          </p>
        </div>
      </div>
    </div>



  );
}