import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Initialize the NextResponse object to pass down the chain
  const res = NextResponse.next();

  // Create a Supabase server client for checking auth state
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Retrieve cookie by name from the request
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        // Set a new cookie on the response
        set(name: string, value: string, options) {
          res.cookies.set(name, value, options);
        },
        // Remove a cookie by setting it to an empty string
        remove(name: string, options) {
          res.cookies.set(name, "", options);
        },
      },
    }
  );

  // Read the current user's session from Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define paths that require the user to be authenticated
  const protectedPaths = ["/dashboard", "/notes/create", "/schedule"];
  
  // Check if the current request pathname starts with any protected path
  const isProtected = protectedPaths.some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );

  // If the route is protected and no user is logged in, redirect to the login page
  if (isProtected && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Continue to the requested route
  return res;
}

// Configure the middleware to run on specific paths
export const config = {
  // Apply middleware to all paths except API routes, static files, images, favicon, and the login page itself
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
