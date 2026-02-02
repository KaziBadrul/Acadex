// components/AuthForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const loading = false; // Add a loading state if desired

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    // setLoading(true);

    if (view === "sign-up") {
      // SIGN UP CALL: Creates user and sends confirmation email
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(`Error signing up: ${error.message}`);
      } else {
        setMessage("Success! Check your email for the confirmation link.");
      }
    } else {
      // SIGN IN CALL: Logs in user with email/password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`Error logging in: ${error.message}`);
      } else {
        // Successful sign-in, redirect to a protected route
        router.push("/dashboard");
      }
    }
    // setLoading(false);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-sm mx-auto p-10 bg-white rounded-2xl shadow-2xl border border-gray-100 transition duration-300 hover:shadow-3xl">
      <h2 className="text-3xl font-extrabold text-center text-gray-900 tracking-tight">
        {view === "sign-in" ? "Welcome Back" : "Start Your Acadex Journey"}
      </h2>
      <p className="text-center text-sm text-gray-700">
        {view === "sign-in" ? "Sign in to access your notes and resources." : "Create your free account in seconds."}
      </p>

      <form onSubmit={handleAuth} className="flex flex-col space-y-5 text-black ">
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="p-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {view === "sign-in" ? "Sign In Securely" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-700">
        {view === "sign-in" ? (
          <>
            New to Acadex?{" "}
            <button
              className="text-blue-600 font-medium hover:text-blue-700 transition duration-150 hover:underline"
              onClick={() => setView("sign-up")}
            >
              Sign Up Now
            </button>
          </>
        ) : (
          <>
            Have an account?{" "}
            <button
              className="text-blue-600 font-medium hover:text-blue-700 transition duration-150 hover:underline"
              onClick={() => setView("sign-in")}
            >
              Sign In
            </button>
          </>
        )}
      </p>

      {message && (
        <p
          className={`text-center mt-4 p-3 rounded-lg border font-medium ${message.includes("Error")
            ? "bg-red-50 text-red-700 border-red-300"
            : "bg-green-50 text-green-700 border-green-300"
            }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}