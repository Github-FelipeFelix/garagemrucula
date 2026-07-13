"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Copy } from "lucide-react";
import type { Part } from "@/lib/types";
import { PART_CATEGORIES } from "@/lib/types";
import { PhotoUploader } from "./PhotoUploader";
import { VideoUploader } from "./VideoUploader";
import { QrCard } from "./QrCard";
import { Toast } from "./Toast";

type Media = { path: string; url: string };

export function PartForm({ part }: { part?: Part }) {
  const router = useRouter();
  const editing = !!part;

  const [form, setForm] = useState({
    title: part?.title ?? "",
    slug: part?.slug ?? "",
    category: part?.category ?? "",
    condition: part?.condition ?? "usado",
    brand: part?.brand ?? "",
    compatibility: part?.compatibility ?? "",
    price: part?.price?.toString() ?? "",
    description: part?.description ?? "",
    status: part?.status ?? "disponivel",
    featured: part?.featured ?? false,
    tags: (part?.tags ?? []).join(", "),
  });
  const [photos, setPhotos] = useState<Media[]>(part?.photos ?? []);
  const [videos, setVideos] = useState<Media[]>(part?.videos ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      photos,
      videos,
    };
    const url = editing ? `/api/admin/parts/${part.id}` : "/api/admin/parts";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error || "Erro ao salvar.");
      setSaving(false);
      return;
    }
    setToast(editing ? "Alterações salvas! ✓" : "Peça criada! ✓");
    setTimeout(() => {
      router.push("/admin/pecas");
      router.refresh();
    }, 900);
  }

  async function onDelete() {
    if (!editing || !window.confirm("Apagar esta peça? Não dá pra desfazer.")) return;
    setSaving(true);
    const res = await fetch(`/api/admin/parts/${part.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Erro ao apagar.");
      setSaving(false);
      return;
    }
    setToast("Peça apagada.");
    setTimeout(() => {
      router.push("/admin/pecas");
      router.refresh();
    }, 700);
  }

  async function onDuplicate() {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/admin/parts/${part.id}/duplicate`, { method: "POST" });
    const j = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
    if (!res.ok || !j.id) {
      setError(j.error || "Erro ao duplicar.");
      setSaving(false);
      return;
    }
    setToast("Peça duplicada! ✓");
    setTimeout(() => {
      router.push(`/admin/pecas/${j.id}`);
      router.refresh();
    }, 700);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-24">
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
        <div>
          <label className="label">Nome da peça *</label>
          <input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex: Jogo de rodas Porsche aro 15" />
        </div>
        <div>
          <label className="label">Endereço (slug) — deixe vazio para gerar do nome</label>
          <input className="input" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="rodas-porsche-aro-15" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="label">Categoria</label>
            <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Selecione…</option>
              {PART_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="input" value={form.condition} onChange={(e) => set("condition", e.target.value as typeof form.condition)}>
              <option value="novo">Novo</option>
              <option value="seminovo">Seminovo</option>
              <option value="usado">Usado</option>
            </select>
          </div>
          <div><label className="label">Preço (R$)</label><input className="input" inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="vazio = sob consulta" /></div>
          <div><label className="label">Marca / fabricante</label><input className="input" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="BBS, Cibié, Pirelli…" /></div>
          <div className="sm:col-span-2"><label className="label">Compatibilidade (serve em)</label><input className="input" value={form.compatibility} onChange={(e) => set("compatibility", e.target.value)} placeholder="Ex: Fusca, Brasília, Kombi" /></div>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set("status", e.target.value as typeof form.status)}>
              <option value="disponivel">Disponível</option>
              <option value="reservado">Reservado</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm text-ink">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-rucula" />
            Destaque na home
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
        <div>
          <label className="label">Fotos</label>
          <PhotoUploader value={photos} onChange={setPhotos} folder="parts" />
        </div>
        <div>
          <label className="label">Vídeos (opcional)</label>
          <VideoUploader value={videos} onChange={setVideos} folder="parts" />
        </div>
        <div>
          <label className="label">Tags (separadas por vírgula)</label>
          <input className="input" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="original, raridade, importado" />
        </div>
        <div>
          <label className="label">Descrição</label>
          <textarea className="input min-h-32" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Conte o estado, medidas, o que acompanha…" />
        </div>
      </section>

      {editing && part.slug && (
        <section className="rounded-xl border border-line bg-surface p-4">
          <label className="label">QR Code — imprima e cole na peça (abre a página dela)</label>
          <QrCard slug={part.slug} base="pecas" />
        </section>
      )}

      {toast && <Toast message={toast} />}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          {editing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDelete}
                disabled={saving}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition hover:border-red-500 hover:bg-red-500/20 disabled:opacity-50"
              >
                <Trash2 size={16} /> Apagar
              </button>
              <button
                type="button"
                onClick={onDuplicate}
                disabled={saving}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm font-semibold text-ink transition hover:border-rucula-bright hover:text-rucula-bright disabled:opacity-50"
              >
                <Copy size={16} /> Duplicar
              </button>
            </div>
          ) : (
            <span />
          )}
          <button type="submit" disabled={saving} className="btn btn-primary whitespace-nowrap">
            {saving ? <Loader2 className="animate-spin" size={18} /> : null}
            <span className="sm:hidden">{editing ? "Salvar" : "Criar"}</span>
            <span className="hidden sm:inline">{editing ? "Salvar alterações" : "Criar peça"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
