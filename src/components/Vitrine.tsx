"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Car } from "@/lib/types";
import { CarCard } from "./CarCard";

const selectClass =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-rucula-bright";

export function Vitrine({ cars }: { cars: Car[] }) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [tag, setTag] = useState("");
  const [order, setOrder] = useState<"recentes" | "barato" | "caro">("recentes");
  const [showSold, setShowSold] = useState(true);

  const brands = useMemo(
    () => [...new Set(cars.map((c) => c.brand).filter(Boolean) as string[])].sort(),
    [cars],
  );
  const tags = useMemo(() => [...new Set(cars.flatMap((c) => c.tags))].sort(), [cars]);

  const filtered = useMemo(() => {
    const out = cars.filter((c) => {
      if (!showSold && c.status === "vendido") return false;
      if (brand && c.brand !== brand) return false;
      if (tag && !c.tags.includes(tag)) return false;
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
  }, [cars, q, brand, tag, order, showSold]);

  return (
    <div>
      {/* Filtros */}
      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
          <SlidersHorizontal size={16} /> Filtros
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 sm:min-w-56">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar carro, marca, modelo…"
              className="w-full rounded-lg border border-line bg-bg py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-rucula-bright"
            />
          </div>
          <select className={selectClass} value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">Todas as marcas</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select className={selectClass} value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">Todos os estilos</option>
            {tags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select className={selectClass} value={order} onChange={(e) => setOrder(e.target.value as typeof order)}>
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
        </div>
      </div>

      {/* Resultados */}
      {filtered.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-muted">{filtered.length} carro(s)</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
