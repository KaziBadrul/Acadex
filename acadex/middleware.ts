// middleware.ts

import { createServerClient } from "@supabase/ssr"; // <-- Correct import
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a server-side Supabase client to read the session from cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => res.cookies.set(name, value, options),
        remove: (name, options) => res.cookies.set(name, "", options),
      },
    }
  );

  // 1. Check for the user session (This also refreshes the session cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Define your protected routes (where you don't want unauthorized users)
  const protectedPaths = ["/dashboard", "/notes/create", "/schedule"];
  const isProtected = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // 3. Enforce protection
  if (isProtected && !user) {
    // Redirect unauthorized users to the login page
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return res;
}

// 4. Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Apply middleware to all routes except API, static files, and the login page itself
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
