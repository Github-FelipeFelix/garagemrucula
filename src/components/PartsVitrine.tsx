"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Part } from "@/lib/types";
import { PART_CONDITION_LABEL } from "@/lib/types";
import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "./icons";
import { PartCard } from "./PartCard";

const selectClass =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-rucula-bright";

const PRICE_RANGES = [
  { value: "", label: "Qualquer preço" },
  { value: "0-200", label: "Até R$ 200" },
  { value: "200-1000", label: "R$ 200–1 mil" },
  { value: "1000-5000", label: "R$ 1–5 mil" },
  { value: "5000-", label: "Acima de R$ 5 mil" },
];

export function PartsVitrine({ parts }: { parts: Part[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [order, setOrder] = useState<"recentes" | "barato" | "caro">("recentes");
  const [showSold, setShowSold] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories = useMemo(
    () => [...new Set(parts.map((p) => p.category).filter(Boolean) as string[])].sort(),
    [parts],
  );

  const filtered = useMemo(() => {
    const [pMin, pMax] = price
      ? price.split("-").map((n) => (n === "" ? null : Number(n)))
      : [null, null];
    const out = parts.filter((p) => {
      if (!showSold && p.status === "vendido") return false;
      if (category && p.category !== category) return false;
      if (condition && p.condition !== condition) return false;
      if (pMin != null && (p.price ?? 0) < pMin) return false;
      if (pMax != null && (p.price ?? Infinity) > pMax) return false;
      if (q) {
        const hay = `${p.title} ${p.category ?? ""} ${p.brand ?? ""} ${p.compatibility ?? ""} ${p.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    if (order === "barato" || order === "caro") {
      out.sort((a, b) => {
        const pa = a.price ?? Infinity;
        const pb = b.price ?? Infinity;
        return order === "barato" ? pa - pb : pb - pa;
      });
    }
    return out;
  }, [parts, q, category, condition, price, order, showSold]);

  const hasFilters = !!(q || category || condition || price || !showSold);
  const panelCount = [category, condition, price].filter(Boolean).length + (showSold ? 0 : 1);
  function clearFilters() {
    setQ("");
    setCategory("");
    setCondition("");
    setPrice("");
    setShowSold(true);
  }

  return (
    <div>
      <div className="glass mb-8 flex flex-col gap-3 rounded-2xl border border-line p-4 sm:sticky sm:top-16 sm:z-30">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar peça, categoria, marca…"
              className="w-full rounded-lg border border-line bg-bg py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-rucula-bright"
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink sm:hidden"
            aria-expanded={filtersOpen}
            aria-controls="filtros-pecas"
          >
            <SlidersHorizontal size={16} /> Filtros
            {panelCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rucula px-1 text-xs font-bold text-black">
                {panelCount}
              </span>
            )}
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="hidden shrink-0 text-xs text-rucula-bright hover:underline sm:block"
            >
              limpar
            </button>
          )}
        </div>

        <div
          id="filtros-pecas"
          className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-3 sm:flex sm:flex-row sm:flex-wrap sm:items-center`}
        >
          <select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Categoria">
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className={selectClass} value={condition} onChange={(e) => setCondition(e.target.value)} aria-label="Estado">
            <option value="">Qualquer estado</option>
            <option value="novo">{PART_CONDITION_LABEL.novo}</option>
            <option value="seminovo">{PART_CONDITION_LABEL.seminovo}</option>
            <option value="usado">{PART_CONDITION_LABEL.usado}</option>
          </select>
          <select className={selectClass} value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Faixa de preço">
            {PRICE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <select className={selectClass} value={order} onChange={(e) => setOrder(e.target.value as typeof order)} aria-label="Ordenar">
            <option value="recentes">Mais recentes</option>
            <option value="barato">Menor preço</option>
            <option value="caro">Maior preço</option>
          </select>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={showSold}
              onChange={(e) => setShowSold(e.target.checked)}
              className="accent-rucula"
            />
            Mostrar vendidas
          </label>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-left text-xs text-rucula-bright hover:underline sm:hidden"
            >
              limpar filtros
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-muted">{filtered.length} peça(s)</p>
          <div data-reveal-stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        </>
      ) : parts.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="font-display text-xl font-bold">Em breve, peças por aqui.</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Estamos preparando o estoque de rodas, pneus, faróis e mais. Fala com a gente que a
            gente te avisa das novidades!
          </p>
          <a
            href={whatsappLink("Olá! Queria saber das peças disponíveis na Garagem Rucula.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-zap mx-auto mt-6"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Falar no WhatsApp
          </a>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center text-muted">
          Nenhuma peça encontrada com esses filtros.
        </div>
      )}
    </div>
  );
}
