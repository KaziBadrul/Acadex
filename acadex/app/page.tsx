/**
 * app/page.tsx
 * Refined premium landing page for Acadex with cinematic animations
 */
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import {
  BookOpen,
  Users,
  Share2,
  ShieldCheck,
  Zap,
  Layout,
  CheckCircle2
} from "lucide-react";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const checkSession = async () => {
      await supabase.auth.getSession();
      setLoading(false);
    };
    checkSession();
  }, [supabase]);

  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [loading]);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="w-8 h-8 border-2 border-[#4C6FFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#1E2A38] font-sans selection:bg-[#4C6FFF]/10 selection:text-[#4C6FFF] overflow-x-hidden">
      {/* Cinematic Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4C6FFF]/5 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[150px] rounded-full animate-float [animation-delay:2s]" />
      </div>

      {/* 1) Top Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-[#F8F9FB]/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-in fade-in duration-1000">
            <Image
              src="/ACADEX_dark.png"
              alt="Acadex Logo"
              width={120}
              height={36}
              className="object-contain sm:w-[140px]"
              priority
            />
          </div>

          <div className="flex items-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-right-4 duration-1000">
            <Link
              href="/login"
              className="hidden xs:block text-sm font-bold text-[#1E2A38]/70 hover:text-[#1E2A38] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login?view=signup"
              className="bg-[#4C6FFF] text-white text-xs sm:text-sm font-bold py-2 sm:py-2.5 px-4 sm:px-6 rounded-xl hover:bg-[#4C6FFF]/90 hover:-translate-y-0.5 transition-all duration-300 shadow-xl shadow-[#4C6FFF]/20 active:scale-95"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* 2) Hero Section */}
        <section className="pt-20 sm:pt-32 pb-16 sm:pb-24 px-6 text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="mb-8 sm:mb-12 animate-swoop-in">
              <Image
                src="/ACADEX_dark.png"
                alt="Acadex"
                width={700}
                height={150}
                className="object-contain w-full max-w-[300px] sm:max-w-[700px] drop-shadow-2xl"
              />
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Organize your academic world.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-[#1E2A38]/60 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-400">
              Notes, groups, and shared knowledge — all in one focused space designed for modern students.
            </p>

            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-600">
              <Link
                href="/login?view=signup"
                className="w-full sm:w-auto bg-[#4C6FFF] text-white font-bold py-4 px-10 rounded-2xl hover:bg-[#4C6FFF]/90 hover:-translate-y-1 transition-all duration-300 shadow-2xl shadow-[#4C6FFF]/20 active:scale-95 text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* 3) Feature Highlights Grid */}
        <section ref={addToRefs} className="reveal py-24 px-6 bg-white/40 backdrop-blur-sm border-y border-gray-200/40">
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
                  className={`reveal stagger-${idx + 1} p-6 sm:p-8 rounded-[2rem] border border-gray-100 bg-white/80 hover:bg-white hover:shadow-2xl hover:border-[#4C6FFF]/20 transition-all duration-500 group sm:hover:-translate-y-2`}
                  ref={addToRefs}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-6 sm:mb-8 flex items-center justify-center ${feature.color} group-hover:scale-110 sm:group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
                    <feature.icon size={24} className="sm:size-[28px]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 tracking-tight group-hover:text-[#4C6FFF] transition-colors">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-[#1E2A38]/60 leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4) Redesigned "Trust" Feature Section */}
        <section ref={addToRefs} className="reveal py-20 sm:py-32 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-[2rem] sm:rounded-[3rem] border border-gray-200/60 p-8 sm:p-12 md:p-20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-[#4C6FFF]/5 blur-2xl sm:blur-3xl -z-10 rounded-full animate-float" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
              <div ref={addToRefs} className="reveal stagger-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4C6FFF]/5 text-[#4C6FFF] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 sm:mb-8 border border-[#4C6FFF]/10 mx-auto lg:mx-0">
                  <ShieldCheck size={14} />
                  Student Focused
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6 sm:mb-8 leading-[1.1]">
                  Designed for modern classrooms and real study workflows.
                </h2>
                <p className="text-base sm:text-lg text-[#1E2A38]/60 leading-relaxed mb-8 sm:mb-12 font-medium max-w-xl mx-auto lg:mx-0">
                  Built by students for students. We understand the chaos of academic life, so we created a sanctuary for your study materials and collaborative efforts.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
                  {[
                    { title: "Secure groups", icon: Users },
                    { title: "Fast uploads", icon: Zap },
                    { title: "Clean organization", icon: Layout }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8F9FB] border border-gray-100/50 hover:border-[#4C6FFF]/30 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#4C6FFF] shadow-sm group-hover:scale-110 transition-transform">
                        <item.icon size={20} />
                      </div>
                      <span className="font-bold text-[#1E2A38]/80">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div ref={addToRefs} className="reveal stagger-2 relative">
                <div className="absolute -inset-10 bg-[#4C6FFF]/10 blur-[100px] rounded-full -z-10 animate-pulse"></div>
                <div className="bg-[#F8F9FB]/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-gray-200/60 shadow-inner relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="w-10 h-10 rounded-full bg-[#4C6FFF]/10 border border-[#4C6FFF]/20"></div>
                    </div>
                    {[
                      { l: "Spring Semester 2024", c: "bg-blue-500", w: "w-full", d: "0s" },
                      { l: "Quantum Physics Notes", c: "bg-emerald-500", w: "w-3/4", d: "0.2s" },
                      { l: "Lab Report Final.pdf", c: "bg-amber-500", w: "w-1/2", d: "0.4s" }
                    ].map((row, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#1E2A38]/40">
                          <span>{row.l}</span>
                          <span className="animate-pulse">{i === 0 ? "85%" : i === 1 ? "42%" : "99%"}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${row.c} rounded-full transition-all duration-[1.5s] delay-300 ${row.w}`}
                            style={{ transitionDelay: row.d }}
                          ></div>
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
        <section ref={addToRefs} className="reveal py-20 sm:py-24 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div ref={addToRefs} className="reveal stagger-1 order-2 lg:order-1 flex justify-center lg:block">
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-200 shadow-2xl space-y-4 w-full max-w-sm relative transform sm:-rotate-1 group sm:hover:rotate-0 transition-all duration-700">
                <div className="absolute -top-4 -right-4 w-16 sm:w-24 h-16 sm:h-24 bg-[#4C6FFF]/10 blur-xl sm:blur-2xl -z-10 group-hover:bg-[#4C6FFF]/20 transition-colors"></div>
                <div className="h-4 w-20 sm:w-24 bg-gray-100 rounded-md mb-4 sm:mb-6"></div>
                {[
                  { label: "Week 3 Lecture", status: "Completed", color: "text-emerald-600 bg-emerald-50" },
                  { label: "Midterm Review", status: "Draft", color: "text-amber-600 bg-amber-50" },
                  { label: "Group Folder", status: "Shared", color: "text-blue-600 bg-blue-50" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300">
                    <span className="text-xs sm:text-sm font-bold text-[#1E2A38]/80">{item.label}</span>
                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div ref={addToRefs} className="reveal stagger-2 order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6 sm:mb-8">
                Built for clarity, not clutter.
              </h2>
              <p className="text-base sm:text-lg text-[#1E2A38]/60 leading-relaxed mb-8 sm:mb-10 font-medium mx-auto lg:mx-0">
                Focus is the engine of academic success. Acadex is engineered to eliminate noise, providing a structured, distraction-free environment for your lectures, research, and collaborative study groups.
              </p>
              <ul className="space-y-4 sm:space-y-5 text-left inline-block lg:block">
                {[
                  "Minimalist architecture for maximum focus",
                  "Logical categorization by subject & semester",
                  "Single-click access to shared resources"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base font-bold text-[#1E2A38]/80 leading-snug group">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4C6FFF]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={14} className="sm:size-[16px] text-[#4C6FFF]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 6) Final CTA Section */}
        <section ref={addToRefs} className="reveal py-20 sm:py-32 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto p-8 sm:p-12 md:p-24 rounded-[2rem] sm:rounded-[3.5rem] bg-white border border-gray-200 shadow-[0_32px_64px_-16px_rgba(76,111,255,0.1)] text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 sm:w-80 h-48 sm:h-80 bg-[#4C6FFF]/5 rounded-full blur-[60px] sm:blur-[100px] group-hover:bg-[#4C6FFF]/10 transition-colors duration-1000 animate-float"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 sm:w-80 h-48 sm:h-80 bg-purple-500/5 rounded-full blur-[60px] sm:blur-[100px] group-hover:bg-purple-500/10 transition-colors duration-1000 animate-float [animation-delay:2s]"></div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 sm:mb-6 relative z-10 leading-tight">
              Start your study space in minutes.
            </h2>
            <p className="text-base sm:text-xl text-[#1E2A38]/60 mb-8 sm:mb-12 relative z-10 font-medium max-w-xl mx-auto leading-relaxed">
              Create an account or sign in to continue building your academic knowledge base.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative z-10">
              <Link
                href="/login?view=signup"
                className="w-full sm:w-auto bg-[#4C6FFF] text-white font-bold py-4 sm:py-5 px-10 sm:px-14 rounded-xl sm:rounded-2xl hover:bg-[#4C6FFF]/90 sm:hover:-translate-y-1.5 transition-all duration-300 shadow-xl shadow-[#4C6FFF]/30 active:scale-95 text-center"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-[#F8F9FB] text-[#1E2A38] border border-gray-200 font-bold py-4 sm:py-5 px-10 sm:px-14 rounded-xl sm:rounded-2xl hover:bg-white sm:hover:-translate-y-1.5 sm:hover:shadow-xl transition-all duration-300 active:scale-95 text-center"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7) Footer */}
      <footer className="py-12 sm:py-16 px-6 border-t border-gray-200/50 bg-[#F8F9FB]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 text-center md:text-left">
          <div className="flex items-center gap-2 grayscale opacity-40 hover:opacity-100 transition-opacity">
            <Image
              src="/ACADEX_dark.png"
              alt="Acadex Logo"
              width={80}
              height={24}
              className="object-contain sm:w-[100px]"
            />
          </div>

          <p className="text-xs sm:text-sm text-[#1E2A38]/40 font-bold tracking-tight order-3 md:order-2">
            &copy; {new Date().getFullYear()} Acadex. Built for focus.
          </p>

          <div className="flex items-center gap-6 sm:gap-10 order-2 md:order-3">
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