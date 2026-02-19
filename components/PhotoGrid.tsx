"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { DemoPhoto } from "@/lib/demoData";

export default function PhotoGrid({
  photos,
  initialCount = 12,
}: {
  photos: DemoPhoto[];
  initialCount?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const [active, setActive] = useState<DemoPhoto | null>(null);

  const visible = useMemo(() => {
    if (showAll) return photos;
    return photos.slice(0, initialCount);
  }, [photos, showAll, initialCount]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p)}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            type="button"
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute bottom-2 left-2 right-2 text-left text-xs text-white/90">
                {p.note ? p.note : "Tap to view"}
              </div>
            </div>
          </button>
        ))}
      </div>

      {photos.length > initialCount && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/85 transition hover:bg-white/10"
            type="button"
          >
            {showAll ? "Show less" : `Show more (${photos.length - initialCount} more)`}
          </button>
        </div>
      )}

      {/* Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setActive(null)}
          role="button"
          tabIndex={-1}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-sm text-white/80">{active.alt}</div>
              <button
                onClick={() => setActive(null)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
                type="button"
              >
                Close
              </button>
            </div>

            <div className="relative aspect-[16/10] w-full bg-black">
              <Image src={active.src} alt={active.alt} fill className="object-contain" sizes="90vw" />
            </div>

            {active.note ? (
              <div className="px-4 py-3 text-sm text-white/80">
                <span className="text-white/60">Note: </span>
                {active.note}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
