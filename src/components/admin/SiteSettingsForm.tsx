"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Toast } from "./Toast";
import type { SiteSettings } from "@/lib/settings";

// Editor dos textos do site (o primo mexe sem depender de ninguém). Salva em
// /api/admin/settings; o site revalida na hora.
export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [f, setF] = useState<SiteSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setDif(i: number, key: "titulo" | "texto", v: string) {
    setF((s) => ({
      ...s,
      diferenciais: s.diferenciais.map((d, j) => (j === i ? { ...d, [key]: v } : d)),
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error || "Erro ao salvar.");
      setSaving(false);
      return;
    }
    setToast("Textos salvos! ✓ Já estão no ar.");
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6 pb-24">
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
        <p className="font-display font-bold">Página inicial</p>
        <div>
          <label className="label">Frase abaixo do nome (subtítulo do topo)</label>
          <textarea
            className="input min-h-20"
            value={f.heroSubtitulo}
            onChange={(e) => setF((s) => ({ ...s, heroSubtitulo: e.target.value }))}
            placeholder="Carros antigos, importados e modificados…"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
        <p className="font-display font-bold">Página &quot;Sobre&quot;</p>
        <div>
          <label className="label">História — 1º parágrafo</label>
          <textarea
            className="input min-h-28"
            value={f.sobreP1}
            onChange={(e) => setF((s) => ({ ...s, sobreP1: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">História — 2º parágrafo</label>
          <textarea
            className="input min-h-28"
            value={f.sobreP2}
            onChange={(e) => setF((s) => ({ ...s, sobreP2: e.target.value }))}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
        <p className="font-display font-bold">Os 3 diferenciais (cartões do &quot;Sobre&quot;)</p>
        {f.diferenciais.map((d, i) => (
          <div key={i} className="rounded-lg border border-line bg-surface-2 p-3">
            <label className="label">Cartão {i + 1} — título</label>
            <input className="input" value={d.titulo} onChange={(e) => setDif(i, "titulo", e.target.value)} />
            <label className="label mt-2">Cartão {i + 1} — texto</label>
            <textarea className="input min-h-20" value={d.texto} onChange={(e) => setDif(i, "texto", e.target.value)} />
          </div>
        ))}
      </section>

      {toast && <Toast message={toast} />}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-end">
          <button type="submit" disabled={saving} className="btn btn-primary whitespace-nowrap">
            {saving ? <Loader2 className="animate-spin" size={18} /> : null}
            Salvar textos
          </button>
        </div>
      </div>
    </form>
  );
}
