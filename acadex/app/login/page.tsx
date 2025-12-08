// app/login/page.tsx

import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <AuthForm />
    </main>
  );
}
