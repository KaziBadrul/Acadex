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
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (view === "sign-up") {
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`Error logging in: ${error.message}`);
      } else {
        router.push("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div className="w-full bg-card p-8 md:p-10 rounded-[16px] shadow-subtle border border-muted/20">
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-2xl font-semibold text-primary tracking-tight">
          {view === "sign-in" ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-sm text-primary/60">
          {view === "sign-in" ? "Enter your details to sign in." : "Start organizing your study space."}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4 text-primary">
        <div className="space-y-1">
          <label className="text-sm font-medium text-primary/80">Email</label>
          <input
            type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 bg-background/50 border border-muted/40 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all duration-200 placeholder:text-muted"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-primary/80">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full p-3 bg-background/50 border border-muted/40 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all duration-200 placeholder:text-muted"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : view === "sign-in" ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-primary/70">
          {view === "sign-in" ? "Don't have an account? " : "Already have an account? "}
          <button
            className="text-primary font-medium hover:text-primary/70 underline underline-offset-4 decoration-muted hover:decoration-primary transition-colors"
            onClick={() => {
              setView(view === "sign-in" ? "sign-up" : "sign-in");
              setMessage("");
            }}
          >
            {view === "sign-in" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>

      {message && (
        <div
          className={`mt-6 p-4 rounded-xl text-sm border font-medium ${message.includes("Error")
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-green-50 text-green-700 border-green-200"
            }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
