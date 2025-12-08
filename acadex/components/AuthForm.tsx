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
    <div className="flex flex-col space-y-4 max-w-sm mx-auto p-8 border rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center">
        {view === "sign-in" ? "Sign In to Acadex" : "Create an Account"}
      </h2>

      <form onSubmit={handleAuth} className="flex flex-col space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-3 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-3 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded"
        >
          {view === "sign-in" ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-2">
        {view === "sign-in" ? (
          <>
            Do not have an account?{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setView("sign-up")}
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setView("sign-in")}
            >
              Sign In
            </button>
          </>
        )}
      </p>

      {message && (
        <p
          className={`text-center mt-4 p-2 rounded ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
