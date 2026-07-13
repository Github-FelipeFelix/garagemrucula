"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import type { SitePhoto } from "@/lib/settings";
import { Lightbox } from "./Lightbox";

// Galeria "Nosso espaço" (página Sobre): grade de fotos da garagem que abre em
// tela cheia (Lightbox, o mesmo dos carros — swipe/zoom/teclado). Fotos em alta
// qualidade (next/image quality 90, AVIF/WebP). Some sozinha se não houver foto.
export function EspacoGallery({ photos }: { photos: SitePhoto[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  if (photos.length === 0) return null;

  const items = photos.map((p) => ({ type: "photo" as const, url: p.url, path: p.path }));

  return (
    <div className="mt-14" data-reveal>
      <p className="eyebrow mb-3 justify-center sm:justify-start">Por dentro da garagem</p>
      <h2 className="section-title mb-6 text-center sm:text-left">Nosso espaço</h2>

      <div data-reveal-stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p, i) => (
          <button
            key={p.path}
            type="button"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            aria-label={`Ampliar foto ${i + 1} do espaço`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface-2"
          >
            <Image
              src={p.url}
              alt="Espaço da Garagem Rucula"
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              quality={90}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
              <ZoomIn size={13} /> ampliar
            </span>
          </button>
        ))}
      </div>

      {open && (
        <Lightbox
          items={items}
          index={index}
          title="Nosso espaço — Garagem Rucula"
          onClose={() => setOpen(false)}
          onNavigate={setIndex}
        />
      )}
    </div>
  );
}
