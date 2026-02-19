import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "A Little Album",
  description: "A sweet little photo album site.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-[#07050e] text-white antialiased">
        {/* Background (never blocks clicks) */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.20),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(139,92,246,0.18),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.10),transparent_45%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_30%,transparent_70%,rgba(255,255,255,0.03))]" />
        </div>

        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              <span className="text-white">A Little</span>{" "}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                Album
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/albums"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
              >
                Albums
              </Link>
              <Link
                href="/admin"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>

        {/* Force clicks on content */}
        <main className="pointer-events-auto mx-auto max-w-6xl px-4 py-10">
          {children}
        </main>

        <footer className="border-t border-white/10 bg-black/20">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-white/55">
            Made with love • Purple & violet theme
          </div>
        </footer>
      </body>
    </html>
  );
}
