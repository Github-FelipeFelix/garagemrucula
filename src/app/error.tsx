"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-5xl font-extrabold text-senna">Ops!</p>
      <h1 className="font-display text-2xl font-bold">Algo deu errado</h1>
      <p className="max-w-sm text-muted">
        Tenta de novo. Se continuar, chama a gente no WhatsApp que resolvemos rapidinho.
      </p>
      <div className="mt-2 flex gap-3">
        <button onClick={reset} className="btn btn-primary">
          Tentar de novo
        </button>
        <Link href="/" className="btn btn-outline">
          Início
        </Link>
      </div>
    </div>
  );
}
