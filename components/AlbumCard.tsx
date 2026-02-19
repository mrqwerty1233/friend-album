import Image from "next/image";
import Link from "next/link";

export default function AlbumCard({
  album,
}: {
  album: {
    id: string;
    title: string;
    subtitle?: string | null;
    coverUrl?: string | null;
    photoCount?: number;
  };
}) {
  return (
    <Link
      href={`/albums/${album.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:bg-white/10"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {album.coverUrl ? (
          <Image
            src={album.coverUrl}
            alt={album.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-pink-500/20" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-lg font-semibold text-white">{album.title}</div>
          {album.subtitle ? (
            <div className="text-sm text-white/70">{album.subtitle}</div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm text-white/70">
          {typeof album.photoCount === "number" ? `${album.photoCount} photos` : " "}
        </div>
        <div className="text-sm text-white/80 group-hover:text-white">Open →</div>
      </div>
    </Link>
  );
}
