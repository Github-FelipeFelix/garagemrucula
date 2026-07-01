"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next") || "/admin";
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6">
        <Image src="/logo.png" alt="Garagem Rúcula" width={120} height={88} className="mx-auto h-14 w-auto" />
        <h1 className="mt-4 text-center font-display text-xl font-bold">Painel · Garagem Rúcula</h1>
        <div className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            autoComplete="email"
          />
          <input
            type="password"
            required
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
