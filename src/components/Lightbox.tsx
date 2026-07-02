"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type LightboxItem = { type: "photo" | "video"; url: string; path: string };

const MAX_ZOOM = 4;
const DBL_ZOOM = 2.5;

// Galeria em tela cheia: navega por swipe (mobile), setas (desktop) e teclado.
// Zoom pra ver detalhes do carro: toque duplo, pinça (2 dedos) ou duplo-clique;
// quando ampliado, arrastar move a foto (pan) e o swipe de navegação é desativado.
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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [smooth, setSmooth] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement | null>(null);

  const g = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    panX: 0,
    panY: 0,
    pinchDist: 0,
    pinchZoom: 1,
    lastTap: 0,
    moved: false,
  });

  const many = items.length > 1;
  const zoomed = zoom > 1.01;
  const cur = items[index];

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (dir: number) => {
      if (items.length > 1) onNavigate((index + dir + items.length) % items.length);
    },
    [index, items.length, onNavigate],
  );

  // Toque/clique duplo alterna o zoom com uma animaçãozinha suave.
  const toggleZoom = useCallback(() => {
    setSmooth(true);
    setZoom((z) => (z > 1.01 ? 1 : DBL_ZOOM));
    setPan({ x: 0, y: 0 });
    setTimeout(() => setSmooth(false), 200);
  }, []);

  // Reseta o zoom ao trocar de foto.
  useEffect(() => {
    reset();
  }, [index, reset]);

  // Mantém a miniatura ativa visível na tira (rolagem só do container).
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = activeThumbRef.current;
    if (!strip || !thumb) return;
    const delta =
      thumb.getBoundingClientRect().left -
      strip.getBoundingClientRect().left -
      (strip.clientWidth - thumb.clientWidth) / 2;
    strip.scrollBy({ left: delta, behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  function clampPan(x: number, y: number, z: number) {
    const max = 260 * (z - 1);
    return { x: Math.max(-max, Math.min(max, x)), y: Math.max(-max, Math.min(max, y)) };
  }
  function dist(a: React.Touch, b: React.Touch) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function onTouchStart(e: React.TouchEvent) {
    const s = g.current;
    if (e.touches.length === 2) {
      s.pinchDist = dist(e.touches[0], e.touches[1]);
      s.pinchZoom = zoom;
      s.dragging = false;
      s.moved = true;
    } else if (e.touches.length === 1) {
      s.startX = e.touches[0].clientX;
      s.startY = e.touches[0].clientY;
      s.panX = pan.x;
      s.panY = pan.y;
      s.dragging = true;
      s.moved = false;
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    const s = g.current;
    if (e.touches.length === 2 && s.pinchDist > 0) {
      const next = Math.max(1, Math.min(MAX_ZOOM, s.pinchZoom * (dist(e.touches[0], e.touches[1]) / s.pinchDist)));
      setZoom(next);
      if (next <= 1.01) setPan({ x: 0, y: 0 });
      s.moved = true;
    } else if (e.touches.length === 1 && s.dragging) {
      const dx = e.touches[0].clientX - s.startX;
      const dy = e.touches[0].clientY - s.startY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) s.moved = true;
      if (zoomed) setPan(clampPan(s.panX + dx, s.panY + dy, zoom));
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    const s = g.current;
    const ended = e.touches.length === 0;
    // Toque duplo (toque simples, parado): alterna zoom.
    if (ended && !s.moved && e.changedTouches.length === 1) {
      const now = Date.now();
      if (now - s.lastTap < 300) {
        toggleZoom();
        s.lastTap = 0;
        s.dragging = false;
        return;
      }
      s.lastTap = now;
    }
    // Swipe (só quando NÃO ampliado, e houve movimento): navega ou fecha.
    if (ended && !zoomed && s.moved) {
      const t = e.changedTouches[0];
      if (t) {
        const dx = t.clientX - s.startX;
        const dy = t.clientY - s.startY;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onClose();
      }
    }
    if (ended) {
      s.dragging = false;
      s.pinchDist = 0;
    }
  }

  // Pan com o mouse no desktop (quando ampliado).
  function onMouseDown(e: React.MouseEvent) {
    if (!zoomed) return;
    const s = g.current;
    s.dragging = true;
    s.startX = e.clientX;
    s.startY = e.clientY;
    s.panX = pan.x;
    s.panY = pan.y;
    e.preventDefault();
  }
  function onMouseMove(e: React.MouseEvent) {
    const s = g.current;
    if (!s.dragging || !zoomed) return;
    setPan(clampPan(s.panX + (e.clientX - s.startX), s.panY + (e.clientY - s.startY), zoom));
  }
  function endMouse() {
    g.current.dragging = false;
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
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        style={{ touchAction: "none" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endMouse}
        onMouseLeave={endMouse}
        onDoubleClick={cur.type === "photo" ? toggleZoom : undefined}
      >
        {cur.type === "photo" ? (
          <div
            className="relative h-full w-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: smooth ? "transform 0.18s ease" : "none",
              cursor: zoomed ? "grab" : "zoom-in",
            }}
          >
            <Image
              key={cur.path}
              src={cur.url}
              alt={title}
              fill
              sizes="100vw"
              quality={95}
              className="select-none object-contain"
              draggable={false}
              priority
            />
          </div>
        ) : (
          <video src={cur.url} controls autoPlay playsInline className="max-h-full max-w-full" />
        )}

        {many && !zoomed && (
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

        {cur.type === "photo" && !zoomed && (
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/70">
            toque 2× ou pince pra ampliar
          </span>
        )}
      </div>

      {many && (
        <div
          ref={stripRef}
          className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:justify-center"
        >
          {items.map((it, i) => (
            <button
              key={it.path + i}
              ref={i === index ? activeThumbRef : null}
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
