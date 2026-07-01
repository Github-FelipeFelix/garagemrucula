"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, ZoomIn } from "lucide-react";
import type { CarPhoto, CarVideo } from "@/lib/types";
import { Lightbox } from "./Lightbox";

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
  const [lbOpen, setLbOpen] = useState(false);

  if (items.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-line bg-surface-2 text-muted">
        Fotos em breve
      </div>
    );
  }

  const idx = Math.min(active, items.length - 1);
  const cur = items[idx];

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface-2">
        {cur.type === "photo" ? (
          <button
            type="button"
            onClick={() => setLbOpen(true)}
            className="absolute inset-0 h-full w-full cursor-zoom-in"
            aria-label="Ampliar foto"
          >
            <Image
              src={cur.url}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 768px"
              quality={90}
              className="object-contain"
              priority
            />
            <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
              <ZoomIn size={13} /> ampliar
            </span>
          </button>
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
                i === idx ? "border-rucula-bright" : "border-line"
              }`}
              aria-label={`Ver ${it.type === "video" ? "vídeo" : "foto"} ${i + 1}`}
            >
              {it.type === "photo" ? (
                <Image src={it.url} alt="" fill sizes="160px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-black text-white">
                  <Play size={18} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {lbOpen && (
        <Lightbox
          items={items}
          index={idx}
          title={title}
          onClose={() => setLbOpen(false)}
          onNavigate={setActive}
        />
      )}
    </div>
  );
}
