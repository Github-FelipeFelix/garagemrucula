"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, ChevronLeft, ChevronRight } from "lucide-react";

// Mídia do card com mini-carrossel: troca de foto sem abrir o anúncio.
// Setas (hover no desktop, sempre no mobile), swipe no mobile e bolinhas.
// A foto continua sendo um link pro anúncio; os controles não disparam a navegação.
export function CarCardMedia({
  photos,
  alt,
  href,
  sold,
  priority = false,
}: {
  photos: string[];
  alt: string;
  href: string;
  sold: boolean;
  priority?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const startX = useRef<number | null>(null);
  const swiping = useRef(false);
  const many = photos.length > 1;

  function change(dir: number) {
    setIdx((i) => (i + dir + photos.length) % photos.length);
  }
  function onArrow(e: React.MouseEvent, dir: number) {
    e.preventDefault();
    e.stopPropagation();
    change(dir);
  }
  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    swiping.current = false;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startX.current != null && Math.abs(e.touches[0].clientX - startX.current) > 10) {
      swiping.current = true;
    }
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    startX.current = null;
    if (many && Math.abs(dx) > 40) change(dx < 0 ? 1 : -1);
  }

  if (photos.length === 0) {
    return (
      <Link href={href} className="flex h-full flex-col items-center justify-center gap-1 text-muted" aria-label={alt}>
        <ImageOff size={22} />
        <span className="text-xs">foto em breve</span>
      </Link>
    );
  }

  return (
    <div
      className="absolute inset-0"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Link
        href={href}
        aria-label={alt}
        className="absolute inset-0 z-10"
        onClick={(e) => {
          if (swiping.current) e.preventDefault(); // se foi swipe, não navega
        }}
      >
        <Image
          src={photos[idx]}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={82}
          className={`object-cover transition duration-500 group-hover:scale-105 ${sold ? "opacity-50" : ""}`}
          priority={priority}
        />
      </Link>

      {many && (
        <>
          <button
            type="button"
            onClick={(e) => onArrow(e, -1)}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white opacity-0 transition hover:bg-black/75 group-hover:opacity-100 max-sm:opacity-100"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => onArrow(e, 1)}
            aria-label="Próxima foto"
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white opacity-0 transition hover:bg-black/75 group-hover:opacity-100 max-sm:opacity-100"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
