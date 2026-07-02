"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
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
  const startX = useRef<number | null>(null);
  const swiping = useRef(false);
  const activeThumb = useRef<HTMLButtonElement | null>(null);

  const n = items.length;
  const idx = Math.min(active, Math.max(0, n - 1));
  const many = n > 1;

  // Ao navegar (setas/swipe), traz a miniatura ativa pra dentro da tira.
  useEffect(() => {
    activeThumb.current?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [idx]);

  if (n === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-line bg-surface-2 text-muted">
        Fotos em breve
      </div>
    );
  }

  const cur = items[idx];

  // Janela [anterior, atual, próxima]: a atual aparece; as vizinhas ficam
  // renderizadas invisíveis (loading eager) pra já estarem no cache — assim a
  // troca de foto é instantânea, sem aquele delay de baixar na hora do clique.
  const windowIdx = many
    ? [...new Set([(idx - 1 + n) % n, idx, (idx + 1) % n])]
    : [idx];

  function go(dir: number) {
    setActive((i) => (Math.min(i, n - 1) + dir + n) % n);
  }
  function onArrow(e: React.MouseEvent, dir: number) {
    e.preventDefault();
    e.stopPropagation();
    go(dir);
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
    if (many && Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface-2"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Camada visual: fotos empilhadas (atual visível, vizinhas pré-carregadas) */}
        {windowIdx.map((wi) => {
          const it = items[wi];
          if (it.type !== "photo") return null;
          const isCur = wi === idx;
          return (
            <Image
              key={it.path}
              src={it.url}
              alt={isCur ? title : ""}
              fill
              sizes="(max-width: 1024px) 100vw, 768px"
              quality={90}
              className={`object-contain transition-opacity duration-200 ${isCur ? "opacity-100" : "opacity-0"}`}
              style={{ zIndex: isCur ? 1 : 0 }}
              priority={isCur}
              loading={isCur ? undefined : "eager"}
              draggable={false}
              aria-hidden={!isCur}
            />
          );
        })}

        {cur.type === "video" && (
          <video
            key={cur.path}
            src={cur.url}
            controls
            playsInline
            className="absolute inset-0 z-[1] h-full w-full object-contain"
          />
        )}

        {/* Camada de interação: abre o lightbox (só em foto) */}
        {cur.type === "photo" && (
          <button
            type="button"
            onClick={() => {
              if (!swiping.current) setLbOpen(true);
            }}
            className="absolute inset-0 z-10 cursor-zoom-in"
            aria-label="Ampliar foto"
          >
            <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
              <ZoomIn size={13} /> ampliar
            </span>
          </button>
        )}

        {many && (
          <>
            <button
              type="button"
              onClick={(e) => onArrow(e, -1)}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white opacity-0 shadow-lg transition hover:bg-black/80 group-hover:opacity-100 max-sm:opacity-100"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={(e) => onArrow(e, 1)}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white opacity-0 shadow-lg transition hover:bg-black/80 group-hover:opacity-100 max-sm:opacity-100"
            >
              <ChevronRight size={22} />
            </button>
            <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              {idx + 1} / {n}
            </span>
          </>
        )}
      </div>

      {many && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {items.map((it, i) => (
            <button
              key={it.path + i}
              ref={i === idx ? activeThumb : null}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === idx
                  ? "border-rucula-bright opacity-100 ring-2 ring-rucula-bright/50"
                  : "border-line/60 opacity-55 hover:opacity-100"
              }`}
              aria-label={`Ver ${it.type === "video" ? "vídeo" : "foto"} ${i + 1}`}
              aria-current={i === idx}
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
