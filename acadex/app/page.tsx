/**
 * app/page.tsx
 * Refined premium landing page for Acadex
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import {
  BookOpen,
  Users,
  Share2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Zap,
  Layout
} from "lucide-react";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      await supabase.auth.getSession();
      setLoading(false);
    };
    checkSession();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="w-6 h-6 border-2 border-[#4C6FFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#1E2A38] font-sans selection:bg-[#4C6FFF]/10 selection:text-[#4C6FFF]">
      {/* 1) Top Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-[#F8F9FB]/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/ACADEX_dark.png"
              alt="Acadex Logo"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-bold text-[#1E2A38]/70 hover:text-[#1E2A38] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login?view=signup"
              className="bg-[#4C6FFF] text-white text-sm font-bold py-2.5 px-6 rounded-xl hover:bg-[#4C6FFF]/90 hover:-translate-y-0.5 transition-all duration-200 shadow-sm shadow-[#4C6FFF]/20 active:scale-95"
            >
              Create account
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-32 pb-24 px-6 text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Logo above headline - spans the headline width */}
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-3 duration-1000">
              <Image
                src="/ACADEX_dark.png"
                alt="Acadex"
                width={700}
                height={150}
                className="object-contain w-full max-w-[700px]"
              />
            </div>

            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Organize your academic world.
            </h1>
            <p className="text-xl md:text-2xl text-[#1E2A38]/60 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Notes, groups, and shared knowledge — all in one focused space designed for modern students.
            </p>
          </div>
        </section>

        {/* 3) Feature Highlights Grid */}
        <section className="py-24 px-6 bg-white border-y border-gray-200/40">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Centralized Notes",
                  desc: "Keep PDFs and materials organized by subject and semester. Never lose track of your literature again.",
                  icon: BookOpen,
                  color: "text-blue-600 bg-blue-50"
                },
                {
                  title: "Private Study Groups",
                  desc: "Collaborate with classmates without the chaos of scattered chats. Focused discussions in one place.",
                  icon: Users,
                  color: "text-emerald-600 bg-emerald-50"
                },
                {
                  title: "Seamless Sharing",
                  desc: "Upload once, access anywhere, and keep everything structured. Build a knowledge base for your peers.",
                  icon: Share2,
                  color: "text-purple-600 bg-purple-50"
                }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-3xl border border-gray-100 bg-[#F8F9FB]/50 hover:bg-white hover:shadow-xl hover:border-[#4C6FFF]/20 hover:-translate-y-1 transition-all duration-500 group"
                >
                  <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-[#1E2A38]/60 leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4) Redesigned "Trust" Feature Section */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] border border-gray-200/60 p-12 md:p-20 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4C6FFF]/5 text-[#4C6FFF] text-xs font-bold uppercase tracking-widest mb-8 border border-[#4C6FFF]/10">
                  <ShieldCheck size={14} />
                  Student Focused
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                  Designed for modern classrooms and real study workflows.
                </h2>
                <p className="text-lg text-[#1E2A38]/60 leading-relaxed mb-12 font-medium max-w-xl">
                  Built by students for students. We understand the chaos of academic life, so we created a sanctuary for your study materials and collaborative efforts.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: "Secure groups", icon: Users },
                    { title: "Fast uploads", icon: Zap },
                    { title: "Clean organization", icon: Layout }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8F9FB] border border-gray-100/50">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#4C6FFF] shadow-sm">
                        <item.icon size={20} />
                      </div>
                      <span className="font-bold text-[#1E2A38]/80">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-10 bg-[#4C6FFF]/10 blur-[100px] rounded-full -z-10 animate-pulse"></div>
                <div className="bg-[#F8F9FB] p-8 rounded-[2rem] border border-gray-200/60 shadow-inner relative overflow-hidden group">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-32 bg-gray-200 rounded-lg"></div>
                      <div className="w-10 h-10 rounded-full bg-[#4C6FFF]/10 border border-[#4C6FFF]/20"></div>
                    </div>
                    {[
                      { l: "Spring Semester 2024", c: "bg-blue-500", w: "w-full" },
                      { l: "Quantum Physics Notes", c: "bg-emerald-500", w: "w-3/4" },
                      { l: "Lab Report Final.pdf", c: "bg-amber-500", w: "w-1/2" }
                    ].map((row, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#1E2A38]/40">
                          <span>{row.l}</span>
                          <span>{i === 0 ? "85%" : i === 1 ? "42%" : "99%"}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${row.c} rounded-full transition-all duration-1000 delay-500 ${row.w}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5) Built for Clarity Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              {/* List View UI Mock */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-4 max-w-sm ml-auto mr-auto lg:ml-0 relative transform -rotate-1 group hover:rotate-0 transition-transform duration-500">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#4C6FFF]/5 blur-2xl -z-10 group-hover:bg-[#4C6FFF]/15 transition-colors"></div>
                <div className="h-4 w-24 bg-gray-100 rounded-md mb-6"></div>
                {[
                  { label: "Week 3 Lecture", status: "Completed", color: "text-emerald-600 bg-emerald-50" },
                  { label: "Midterm Review", status: "Draft", color: "text-amber-600 bg-amber-50" },
                  { label: "Group Folder", status: "Shared", color: "text-blue-600 bg-blue-50" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white transition-colors duration-300">
                    <span className="text-sm font-bold text-[#1E2A38]/80">{item.label}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
                Built for clarity, not clutter.
              </h2>
              <p className="text-lg text-[#1E2A38]/60 leading-relaxed mb-10 font-medium">
                Focus is the engine of academic success. Acadex is engineered to eliminate noise, providing a structured, distraction-free environment for your lectures, research, and collaborative study groups.
              </p>
              <ul className="space-y-5">
                {[
                  "Minimalist architecture for maximum focus",
                  "Logical categorization by subject & semester",
                  "Single-click access to shared resources"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-base font-bold text-[#1E2A38]/80 leading-snug">
                    <div className="w-6 h-6 rounded-full bg-[#4C6FFF]/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} className="text-[#4C6FFF]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 6) Final CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto p-12 md:p-24 rounded-[3rem] bg-white border border-gray-200 shadow-2xl text-center relative overflow-hidden group">
            {/* Soft decorative background effect */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-[#4C6FFF]/5 rounded-full blur-[100px] group-hover:bg-[#4C6FFF]/10 transition-colors"></div>

            <h2 className="text-5xl font-extrabold tracking-tight mb-4 relative z-10 leading-tight">
              Start your study space in minutes.
            </h2>
            <p className="text-xl text-[#1E2A38]/60 mb-12 relative z-10 font-medium max-w-xl mx-auto leading-relaxed">
              Create an account or sign in to continue building your academic knowledge base.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link
                href="/login?view=signup"
                className="w-full sm:w-auto bg-[#4C6FFF] text-white font-bold py-5 px-12 rounded-2xl hover:bg-[#4C6FFF]/90 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-[#4C6FFF]/20 active:scale-95"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-[#F8F9FB] text-[#1E2A38] border border-gray-200 font-bold py-5 px-12 rounded-2xl hover:bg-white hover:-translate-y-1 transition-all duration-300 active:scale-95"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7) Footer */}
      <footer className="py-16 px-6 border-t border-gray-200/50 bg-[#F8F9FB]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-2 grayscale opacity-40 hover:opacity-100 transition-opacity">
            <Image
              src="/ACADEX_dark.png"
              alt="Acadex Logo"
              width={100}
              height={30}
              className="object-contain"
            />
          </div>

          <p className="text-sm text-[#1E2A38]/40 font-bold tracking-tight">
            &copy; {new Date().getFullYear()} Acadex. Built for focus.
          </p>

          <div className="flex items-center gap-10">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <Link
                key={link}
                href="#"
                className="text-sm font-bold text-[#1E2A38]/40 hover:text-[#4C6FFF] transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}