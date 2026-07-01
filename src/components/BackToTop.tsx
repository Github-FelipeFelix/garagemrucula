"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-lg transition duration-300 hover:-translate-y-0.5 hover:border-rucula-bright hover:text-rucula-bright hover:shadow-[0_0_20px_rgba(74,222,128,0.35)]"
    >
      <ArrowUp size={18} />
    </button>
  );
}
