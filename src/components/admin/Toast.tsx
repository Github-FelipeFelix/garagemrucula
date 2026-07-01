"use client";

import { CheckCircle2 } from "lucide-react";

// Confirmação visual simples pro admin (o primo é leigo — precisa ver que deu certo).
export function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fade-up fixed left-1/2 top-4 z-[110] -translate-x-1/2 rounded-full border border-rucula/50 bg-surface/95 px-4 py-2 shadow-lg shadow-black/40 backdrop-blur"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-rucula-bright">
        <CheckCircle2 size={16} /> {message}
      </p>
    </div>
  );
}
