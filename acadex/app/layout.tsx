import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";
import ReminderNotificationProvider from "@/components/ReminderNotificationProvider";
import AppShell from "@/components/AppShell";
import PwaRegistration from "@/components/PwaRegistration";
import { FocusProvider } from "@/components/focus/FocusContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Acadex Workspace",
  description: "Minimal premium workspace for notes and scheduling.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Acadex",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent dark mode flash — runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased text-[#1E2A38]`}>
        <ThemeProvider>
          <FocusProvider>
            <ReminderNotificationProvider>
              <AppShell>
                {children}
              </AppShell>
            </ReminderNotificationProvider>
          </FocusProvider>
          <PwaRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
