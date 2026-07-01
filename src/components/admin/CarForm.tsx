"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Copy } from "lucide-react";
import type { Car, CarSale } from "@/lib/types";
import { PhotoUploader } from "./PhotoUploader";
import { VideoUploader } from "./VideoUploader";
import { QrCard } from "./QrCard";

type Media = { path: string; url: string };

export function CarForm({ car, sale }: { car?: Car; sale?: CarSale | null }) {
  const router = useRouter();
  const editing = !!car;

  const [form, setForm] = useState({
    title: car?.title ?? "",
    slug: car?.slug ?? "",
    brand: car?.brand ?? "",
    model: car?.model ?? "",
    year: car?.year?.toString() ?? "",
    price: car?.price?.toString() ?? "",
    km: car?.km?.toString() ?? "",
    engine: car?.engine ?? "",
    transmission: car?.transmission ?? "",
    color: car?.color ?? "",
    fuel: car?.fuel ?? "",
    description: car?.description ?? "",
    status: car?.status ?? "disponivel",
    featured: car?.featured ?? false,
    tags: (car?.tags ?? []).join(", "),
    mods: (car?.mods ?? []).join("\n"),
  });
  const [photos, setPhotos] = useState<Media[]>(car?.photos ?? []);
  const [videos, setVideos] = useState<Media[]>(car?.videos ?? []);
  const [saleForm, setSaleForm] = useState({
    sold_price: sale?.sold_price?.toString() ?? "",
    sold_at: sale?.sold_at ?? "",
    notes: sale?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      mods: form.mods.split("\n").map((s) => s.trim()).filter(Boolean),
      photos,
      videos,
      sale: saleForm,
    };
    const url = editing ? `/api/admin/cars/${car.id}` : "/api/admin/cars";
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
    router.push("/admin");
    router.refresh();
  }

  async function onDelete() {
    if (!editing || !window.confirm("Apagar este carro? Não dá pra desfazer.")) return;
    setSaving(true);
    const res = await fetch(`/api/admin/cars/${car.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Erro ao apagar.");
      setSaving(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function onDuplicate() {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/admin/cars/${car.id}/duplicate`, { method: "POST" });
    const j = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
    if (!res.ok || !j.id) {
      setError(j.error || "Erro ao duplicar.");
      setSaving(false);
      return;
    }
    router.push(`/admin/carros/${j.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-24">
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
        <div>
          <label className="label">Título *</label>
          <input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex: VW Fusca 1973 Turbo" />
        </div>
        <div>
          <label className="label">Endereço (slug) — deixe vazio para gerar do título</label>
          <input className="input" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="fusca-1973-turbo" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div><label className="label">Marca</label><input className="input" value={form.brand} onChange={(e) => set("brand", e.target.value)} /></div>
          <div><label className="label">Modelo</label><input className="input" value={form.model} onChange={(e) => set("model", e.target.value)} /></div>
          <div><label className="label">Ano</label><input className="input" inputMode="numeric" value={form.year} onChange={(e) => set("year", e.target.value)} /></div>
          <div><label className="label">Preço (R$)</label><input className="input" inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="vazio = sob consulta" /></div>
          <div><label className="label">KM</label><input className="input" inputMode="numeric" value={form.km} onChange={(e) => set("km", e.target.value)} /></div>
          <div><label className="label">Cor</label><input className="input" value={form.color} onChange={(e) => set("color", e.target.value)} /></div>
          <div><label className="label">Motor</label><input className="input" value={form.engine} onChange={(e) => set("engine", e.target.value)} /></div>
          <div><label className="label">Câmbio</label><input className="input" value={form.transmission} onChange={(e) => set("transmission", e.target.value)} /></div>
          <div><label className="label">Combustível</label><input className="input" value={form.fuel} onChange={(e) => set("fuel", e.target.value)} /></div>
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
          <PhotoUploader value={photos} onChange={setPhotos} />
        </div>
        <div>
          <label className="label">Vídeos (opcional)</label>
          <VideoUploader value={videos} onChange={setVideos} />
        </div>
        <div>
          <label className="label">Tags do nicho (separadas por vírgula)</label>
          <input className="input" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="turbo, rebaixado, antigo, importado" />
        </div>
        <div>
          <label className="label">Modificações / acessórios (um por linha)</label>
          <textarea className="input min-h-24" value={form.mods} onChange={(e) => set("mods", e.target.value)} placeholder={"Turbo\nRodas de Porsche\nSuspensão a ar"} />
        </div>
        <div>
          <label className="label">Descrição</label>
          <textarea className="input min-h-32" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Conte a história e o estado do carro…" />
        </div>
      </section>

      {/* Venda (PRIVADO) — aparece só quando o status é vendido */}
      {form.status === "vendido" && (
        <section className="flex flex-col gap-4 rounded-xl border border-senna/30 bg-surface p-4">
          <div>
            <p className="font-display font-bold text-senna">Venda (particular)</p>
            <p className="text-xs text-muted">Controle só seu — nunca aparece no site.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Valor da venda (R$)</label>
              <input className="input" inputMode="numeric" value={saleForm.sold_price} onChange={(e) => setSaleForm((s) => ({ ...s, sold_price: e.target.value }))} />
            </div>
            <div>
              <label className="label">Data da venda</label>
              <input type="date" className="input" value={saleForm.sold_at} onChange={(e) => setSaleForm((s) => ({ ...s, sold_at: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Observações</label>
            <input className="input" value={saleForm.notes} onChange={(e) => setSaleForm((s) => ({ ...s, notes: e.target.value }))} placeholder="Ex: quem comprou, forma de pagamento…" />
          </div>
        </section>
      )}

      {editing && car.slug && (
        <section className="rounded-xl border border-line bg-surface p-4">
          <label className="label">QR Code — imprima e cole no vidro (abre a página do carro)</label>
          <QrCard slug={car.slug} />
        </section>
      )}

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
            <span className="hidden sm:inline">{editing ? "Salvar alterações" : "Criar carro"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
