// utils/supabase/server.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
// NOTE: Ensure your Database type is imported correctly here
// import { Database } from '@/types/supabase'

// We export the function that creates the client
export function createServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // The set and remove handlers are required by the createServerClient signature
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Error handling required due to set/remove being called outside of a Request/Response cycle
            // This is safe to ignore in read-only server components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // This is safe to ignore
          }
        },
      },
    }
  );
}
