import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "John's WEBSITE",
  description: "A cozy little place for photos and sweet notes.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-[#07050e] text-white antialiased selection:bg-violet-500/30 selection:text-white">
        {/* Background (never blocks clicks) */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          {/* Aurora blobs */}
          <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-violet-500/25 blur-3xl animate-pulse" />
          <div className="absolute -right-52 top-10 h-[560px] w-[560px] rounded-full bg-fuchsia-500/18 blur-3xl animate-pulse" />
          <div className="absolute left-1/2 top-[55%] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-pink-500/12 blur-3xl animate-pulse" />

          {/* Soft vignette + highlight */}
          <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_0%,rgba(255,255,255,0.07),transparent_55%),radial-gradient(900px_circle_at_10%_30%,rgba(168,85,247,0.10),transparent_55%),radial-gradient(900px_circle_at_90%_25%,rgba(236,72,153,0.08),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent_18%,transparent_75%,rgba(0,0,0,0.35))]" />

          {/* Subtle dotted “stars” */}
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:20px_20px]" />

          {/* Thin grid (very subtle) */}
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:72px_72px]" />
        </div>

        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/25 backdrop-blur supports-[backdrop-filter]:bg-black/20">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition group-hover:bg-white/10">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-300 via-fuchsia-300 to-pink-300" />
              </span>

              <span className="font-semibold tracking-tight">
                <span className="text-white/90">A Little</span>{" "}
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                  Album
                </span>
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/albums"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition hover:bg-white/10 hover:text-white"
              >
                Albums
              </Link>

              {/* keep admin but make it subtle (gift-ready) */}
              <Link
                href="/admin"
                className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                Admin
              </Link>
            </nav>
          </div>

          {/* tiny glow line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400/35 to-transparent" />
        </header>

        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

        <footer className="border-t border-white/10 bg-black/15">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-white/55">
            Made with love • A quiet place for moments
          </div>
        </footer>
      </body>
    </html>
  );
}
