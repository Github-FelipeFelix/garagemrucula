"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type LightboxItem = { type: "photo" | "video"; url: string; path: string };

// Galeria em tela cheia: abre a foto grande, navega por swipe (mobile), setas
// (desktop) e teclado; swipe pra baixo ou ESC fecha. Mobile-first para eventos.
export function Lightbox({
  items,
  index,
  title,
  onClose,
  onNavigate,
}: {
  items: LightboxItem[];
  index: number;
  title: string;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const go = useCallback(
    (dir: number) => {
      const n = items.length;
      if (n > 1) onNavigate((index + dir + n) % n);
    },
    [index, items.length, onNavigate],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    // Trava o scroll do body enquanto o lightbox está aberto.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  const cur = items[index];
  const many = items.length > 1;

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current == null || startY.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    startX.current = null;
    startY.current = null;
    // Swipe horizontal claro navega; swipe pra baixo fecha.
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${title}`}
    >
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm text-white/70">{many ? `${index + 1} / ${items.length}` : ""}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
        >
          <X size={22} />
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-2 pb-2"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {cur.type === "photo" ? (
          <Image
            key={cur.path}
            src={cur.url}
            alt={title}
            fill
            sizes="100vw"
            quality={95}
            className="object-contain"
            priority
          />
        ) : (
          <video src={cur.url} controls autoPlay playsInline className="max-h-full max-w-full" />
        )}

        {many && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25 sm:block"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25 sm:block"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>

      {many && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:justify-center">
          {items.map((it, i) => (
            <button
              key={it.path + i}
              type="button"
              onClick={() => onNavigate(i)}
              aria-label={`Ver ${i + 1}`}
              className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 transition ${
                i === index ? "border-rucula-bright" : "border-transparent opacity-50 hover:opacity-90"
              }`}
            >
              {it.type === "photo" ? (
                <Image src={it.url} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-white/10 text-[10px] text-white">
                  vídeo
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
