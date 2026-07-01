"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { CarPhoto, CarVideo } from "@/lib/types";

type Item = { type: "photo" | "video"; url: string; path: string };

export function CarGallery({
  photos,
  videos,
  title,
}: {
  photos: CarPhoto[];
  videos: CarVideo[];
  title: string;
}) {
  const items: Item[] = [
    ...photos.map((p) => ({ type: "photo" as const, url: p.url, path: p.path })),
    ...videos.map((v) => ({ type: "video" as const, url: v.url, path: v.path })),
  ];
  const [active, setActive] = useState(0);

  if (items.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-line bg-surface-2 text-muted">
        Fotos em breve
      </div>
    );
  }

  const cur = items[Math.min(active, items.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface-2">
        {cur.type === "photo" ? (
          <Image
            src={cur.url}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 640px"
            className="object-contain"
            priority
          />
        ) : (
          <video src={cur.url} controls playsInline className="h-full w-full object-contain" />
        )}
      </div>

      {items.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {items.map((it, i) => (
            <button
              key={it.path + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border ${
                i === active ? "border-rucula-bright" : "border-line"
              }`}
              aria-label={`Ver ${it.type === "video" ? "vídeo" : "foto"} ${i + 1}`}
            >
              {it.type === "photo" ? (
                <Image src={it.url} alt="" fill sizes="80px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-black text-white">
                  <Play size={18} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
