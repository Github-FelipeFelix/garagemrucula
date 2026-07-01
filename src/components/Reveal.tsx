"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Efeitos client-side do site público, montados uma vez no layout do (site):
//  1) reveal-on-scroll — revela [data-reveal] / [data-reveal-stagger] ao entrar
//     na viewport. Re-observa a cada troca de rota (usePathname).
//  2) spotlight — brilho radial que segue o cursor sobre elementos .spotlight.
// Ambos respeitam prefers-reduced-motion (o CSS também neutraliza os efeitos).
export function Reveal() {
  const pathname = usePathname();

  // (1) Reveal-on-scroll — re-roda a cada navegação (o DOM da página muda).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let io: IntersectionObserver | null = null;

    // rAF garante que o DOM da nova rota já esteja pintado antes de consultar.
    const raf = requestAnimationFrame(() => {
      const els = document.querySelectorAll<HTMLElement>(
        "[data-reveal], [data-reveal-stagger]",
      );
      if (reduce || !("IntersectionObserver" in window)) {
        els.forEach((el) => el.classList.add("is-visible"));
        return;
      }
      io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              obs.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
      );
      els.forEach((el) => {
        if (!el.classList.contains("is-visible")) io!.observe(el);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [pathname]);

  // (2) Spotlight cursor-follow — um único listener no document.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let el: HTMLElement | null = null;
    let x = 0;
    let y = 0;
    const onMove = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.(".spotlight") as HTMLElement | null;
      if (!target) return;
      el = target;
      x = e.clientX;
      y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (!el) return;
          const r = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${x - r.left}px`);
          el.style.setProperty("--my", `${y - r.top}px`);
        });
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
