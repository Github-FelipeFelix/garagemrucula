"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Car } from "@/lib/types";
import { CarCard } from "./CarCard";

const selectClass =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-rucula-bright";

const PRICE_RANGES = [
  { value: "", label: "Qualquer preço" },
  { value: "0-50000", label: "Até R$ 50 mil" },
  { value: "50000-100000", label: "R$ 50–100 mil" },
  { value: "100000-200000", label: "R$ 100–200 mil" },
  { value: "200000-", label: "Acima de R$ 200 mil" },
];

export function Vitrine({ cars }: { cars: Car[] }) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [tag, setTag] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [order, setOrder] = useState<"recentes" | "barato" | "caro">("recentes");
  const [showSold, setShowSold] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brands = useMemo(
    () => [...new Set(cars.map((c) => c.brand).filter(Boolean) as string[])].sort(),
    [cars],
  );
  const tags = useMemo(() => [...new Set(cars.flatMap((c) => c.tags))].sort(), [cars]);
  const years = useMemo(
    () => [...new Set(cars.map((c) => c.year).filter(Boolean) as number[])].sort((a, b) => b - a),
    [cars],
  );

  const filtered = useMemo(() => {
    const [pMin, pMax] = price
      ? price.split("-").map((n) => (n === "" ? null : Number(n)))
      : [null, null];
    const out = cars.filter((c) => {
      if (!showSold && c.status === "vendido") return false;
      if (brand && c.brand !== brand) return false;
      if (tag && !c.tags.includes(tag)) return false;
      if (year && String(c.year) !== year) return false;
      if (pMin != null && (c.price ?? 0) < pMin) return false;
      if (pMax != null && (c.price ?? Infinity) > pMax) return false;
      if (q) {
        const hay = `${c.title} ${c.brand ?? ""} ${c.model ?? ""} ${c.tags.join(" ")}`.toLowerCase();
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
  }, [cars, q, brand, tag, year, price, order, showSold]);

  const hasFilters = !!(q || brand || tag || year || price || !showSold);
  // Filtros ativos no painel colapsável (não conta a busca, que fica sempre visível).
  const panelCount = [brand, tag, year, price].filter(Boolean).length + (showSold ? 0 : 1);
  function clearFilters() {
    setQ("");
    setBrand("");
    setTag("");
    setYear("");
    setPrice("");
    setShowSold(true);
  }

  return (
    <div>
      <div className="glass mb-8 flex flex-col gap-3 rounded-2xl border border-line p-4 sm:sticky sm:top-16 sm:z-30">
        {/* Busca sempre visível + (mobile) botão que abre os filtros + (desktop) limpar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar carro, marca, modelo…"
              className="w-full rounded-lg border border-line bg-bg py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-rucula-bright"
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink sm:hidden"
            aria-expanded={filtersOpen}
            aria-controls="filtros-painel"
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

        {/* Painel de filtros: colapsa no mobile, sempre visível no desktop */}
        <div
          id="filtros-painel"
          className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-3 sm:flex sm:flex-row sm:flex-wrap sm:items-center`}
        >
          <select className={selectClass} value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Marca">
            <option value="">Todas as marcas</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select className={selectClass} value={year} onChange={(e) => setYear(e.target.value)} aria-label="Ano">
            <option value="">Qualquer ano</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
          <select className={selectClass} value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Faixa de preço">
            {PRICE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <select className={selectClass} value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Estilo">
            <option value="">Todos os estilos</option>
            {tags.map((t) => (
              <option key={t} value={t}>{t}</option>
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
            Mostrar vendidos
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
          <p className="mb-4 text-sm text-muted">{filtered.length} carro(s)</p>
          <div data-reveal-stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center text-muted">
          Nenhum carro encontrado com esses filtros.
        </div>
      )}
    </div>
  );
}
