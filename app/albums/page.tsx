import Link from "next/link";
import AlbumCard from "@/components/AlbumCard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AlbumRow = {
  id: string;
  title: string;
  subtitle: string | null;
  cover_path: string | null;
  photos: { count: number }[] | null; // because we select: photos(count)
};

export default async function AlbumsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("albums")
    .select("id,title,subtitle,cover_path,created_at, photos(count)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-white/80">
        Failed to load albums: {error.message}
      </div>
    );
  }

  const albums = (data ?? []) as AlbumRow[];

  const rows = albums.map((a) => {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Albums</h1>
        <p className="mt-1 text-sm text-white/70">Loaded from Supabase.</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          <div className="text-white font-semibold">No albums yet.</div>
          <div className="mt-1">Create one in Admin.</div>
          <Link
            href="/admin"
            className="mt-4 inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            Go to Admin
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((a) => (
            <AlbumCard key={a.id} album={a} />
          ))}
        </div>
      )}
    </div>
  );
}
