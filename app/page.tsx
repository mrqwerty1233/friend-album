import Link from "next/link";
import SweetNotePanel from "@/components/SweetNotePanel";
import AlbumCard from "@/components/AlbumCard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AlbumRow = {
  id: string;
  title: string;
  subtitle: string | null;
  cover_path: string | null;
  photos: { count: number }[] | null;
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("albums")
    .select("id,title,subtitle,cover_path,created_at, photos(count)")
    .order("created_at", { ascending: false })
    .limit(3);

  const albums = (data ?? []) as AlbumRow[];

  const topAlbums = albums.map((a) => {
    const coverUrl = a.cover_path
      ? supabase.storage.from("albums").getPublicUrl(a.cover_path).data.publicUrl
      : null;

    const photoCount = a.photos?.[0]?.count ?? 0;

    return {
      id: a.id,
      title: a.title,
      subtitle: a.subtitle,
      coverUrl,
      photoCount,
    };
  });

  return (
    <div className="space-y-14">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] sm:p-10">
        {/* local decoration */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="absolute -left-16 top-24 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_30%,transparent_70%,rgba(0,0,0,0.20))]" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/75">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300" />
              A small place for your favorite moments
            </div>

            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Keep your{" "}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                memories
              </span>{" "}
              close.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
              John Albums
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/albums"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-black shadow-[0_10px_30px_rgba(255,255,255,0.10)] transition hover:opacity-90"
              >
                Open Albums
              </Link>

              <Link
                href="#inside"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center text-sm text-white/85 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition hover:bg-white/10 hover:text-white"
              >
                Little details
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <SweetNotePanel />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/75">
              <div className="text-xs tracking-widest text-white/60">TIP</div>
              <div className="mt-2">
                Use the surprise button anytime you want a quick smile.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSIDE */}
      <section id="inside" className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Inside this album</h2>
          <div className="hidden text-sm text-white/55 sm:block">
            Simple • Cozy • Mobile-friendly
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Albums", "Moments grouped into simple collections."],
            ["Photo Viewer", "Tap a photo to view it clean and full-screen."],
            ["Sweet Notes", "A daily note, plus a surprise message button."],
            ["Made for Mobile", "Looks great on phones and tablets."],
            ["Soft + Private", "A quiet space that keeps things simple."],
            ["Gift-ready Design", "Glass cards, glow accents, violet tones."],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 text-sm shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:bg-white/[0.07]"
            >
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl opacity-0 transition group-hover:opacity-100" />
              <div className="font-semibold text-white">{title}</div>
              <div className="mt-1 text-white/70">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ALBUM PREVIEW */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Albums</h2>
          <Link href="/albums" className="text-sm text-white/70 hover:text-white">
            View all →
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Could not load albums: <span className="text-white">{error.message}</span>
          </div>
        ) : topAlbums.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            No albums yet — the first memories will appear here soon.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topAlbums.map((a) => (
              <AlbumCard key={a.id} album={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
