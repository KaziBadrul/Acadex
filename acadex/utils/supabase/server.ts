// import { createServerClient, type CookieOptions } from "@supabase/ssr";
// import { cookies } from "next/headers";

// export function createServer() {
//   const cookieStore = cookies(); // Works in RSC + Route Handlers + Server Actions

//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         // Universal get() that works even when cookieStore.get() does NOT exist (Server Actions)
//         get(name: string) {
//           // getAll() ALWAYS exists (MutableCookies, RequestCookies, ReadonlyRequestCookies)
//           const allCookies = cookieStore.getAll();
//           return allCookies.find((c) => c.name === name)?.value;
//         },

//         // Safe-set only works in Route Handlers; server components cannot set cookies
//         set(name: string, value: string, options: CookieOptions) {
//           try {
//             cookieStore.set({ name, value, ...options });
//           } catch {
//             // Ignore errors in Server Components where cookies cannot be set
//           }
//         },

//         remove(name: string, options: CookieOptions) {
//           try {
//             cookieStore.set({
//               name,
//               value: "",
//               ...options,
//             });
//           } catch {
//             // Ignore for the same reason
//           }
//         },
//       },
//     }
//   );
// }
