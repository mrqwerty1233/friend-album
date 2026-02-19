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
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/75">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            A simple gift site: albums + photos + sweet notes
          </div>

          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            A cozy place to keep{" "}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
              memories
            </span>
            .
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
            Landing page + albums + photo viewer, with a daily random sweet message.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/albums"
              className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-black hover:opacity-90"
            >
              Open Albums
            </Link>

            <Link
              href="/#features"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center text-sm text-white/85 hover:bg-white/10"
            >
              See Features
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          <SweetNotePanel />
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
            <div className="text-xs tracking-widest text-white/60">IDEA</div>
            <div className="mt-2">
              Later we’ll add: more album tools, notes, and surprise messages.
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="space-y-4">
        <h2 className="text-xl font-semibold">Features (Phase 1)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Albums", "Separate moments into simple collections."],
            ["Photo Viewer", "Tap any photo to open a clean modal view."],
            ["Hide/Show More", "Avoid long pages—expand only when needed."],
            ["Random Sweet Message", "Daily-stable note on the landing page."],
            ["Mobile First", "Grid scales properly on phones."],
            ["Gift-ready UI", "Violet/purple gradients + soft glass cards."],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
            >
              <div className="font-semibold text-white">{title}</div>
              <div className="mt-1 text-white/70">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Preview Albums</h2>
          <Link href="/albums" className="text-sm text-white/75 hover:text-white">
            View all →
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Could not load albums: <span className="text-white">{error.message}</span>
          </div>
        ) : topAlbums.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            No albums yet. Go to <span className="text-white">/admin</span> to create one.
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
