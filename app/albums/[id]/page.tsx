import { notFound } from "next/navigation";
import Image from "next/image";
import PhotoGrid from "@/components/PhotoGrid";
import { createClient } from "@/lib/supabase/server";

export default async function AlbumDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params); // ✅ Next 16 fix

  const supabase = await createClient();

  const { data: album, error: albumErr } = await supabase
    .from("albums")
    .select("id,title,subtitle,cover_path")
    .eq("id", id)
    .single();

  if (albumErr || !album) return notFound();

  const { data: photos, error: photosErr } = await supabase
    .from("photos")
    .select("id,storage_path,note,created_at")
    .eq("album_id", id)
    .order("created_at", { ascending: false });

  if (photosErr) {
    return <div className="text-white/80">Failed to load photos: {photosErr.message}</div>;
  }

  const coverUrl = album.cover_path
    ? supabase.storage.from("albums").getPublicUrl(album.cover_path).data.publicUrl
    : null;

  const photoItems =
    photos?.map((p) => ({
      id: p.id,
      src: supabase.storage.from("albums").getPublicUrl(p.storage_path).data.publicUrl,
      alt: "Photo",
      note: p.note ?? undefined,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="relative aspect-[16/7] w-full">
          {coverUrl ? (
            <Image src={coverUrl} alt={album.title} fill className="object-cover" sizes="100vw" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-pink-500/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-semibold text-white">{album.title}</h1>
            {album.subtitle ? <p className="mt-1 text-sm text-white/70">{album.subtitle}</p> : null}
            <p className="mt-2 text-xs text-white/60">{photoItems.length} photos</p>
          </div>
        </div>
      </div>

      <PhotoGrid photos={photoItems} initialCount={12} />
    </div>
  );
}
