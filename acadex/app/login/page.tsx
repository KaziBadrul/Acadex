// app/login/page.tsx
import AuthForm from "@/components/AuthForm";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative subtle background accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-muted/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        <div className="w-full mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <img
            src="/ACADEX_dark.png"
            alt="Acadex"
            className="w-full h-auto object-contain max-w-[400px] mx-auto"
          />
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
