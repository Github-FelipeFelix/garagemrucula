import Link from "next/link";
import type { Car } from "@/lib/types";
import { formatBRL, formatKm } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { CarCardMedia } from "./CarCardMedia";

export function CarCard({ car, priority = false }: { car: Car; priority?: boolean }) {
  const photos = (car.photos ?? []).map((p) => p.url).filter(Boolean) as string[];
  const sold = car.status === "vendido";
  const href = `/carros/${car.slug}`;
  const specs = [
    car.year ? String(car.year) : null,
    car.km != null ? formatKm(car.km) : null,
    car.transmission,
  ].filter(Boolean) as string[];

  return (
    <div className="group card spotlight relative isolate flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-rucula/60 hover:shadow-[0_22px_44px_-24px_rgba(36,165,75,0.7)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <CarCardMedia photos={photos} alt={car.title} href={href} sold={sold} priority={priority} />

        <div className="pointer-events-none absolute left-3 top-3 z-30">
          <StatusBadge status={car.status} />
        </div>

        {car.featured && !sold && (
          <div className="pointer-events-none absolute right-3 top-3 z-30 rounded-full bg-senna px-2 py-0.5 text-xs font-bold text-black">
            ★ destaque
          </div>
        )}

        {/* Selo VENDIDO diagonal por cima da foto (prova social) */}
        {sold && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
            <span className="rotate-[-10deg] rounded-md border-2 border-white/85 px-6 py-2 font-display text-3xl font-extrabold uppercase tracking-widest text-white shadow-lg">
              Vendido
            </span>
          </div>
        )}
      </div>

      <Link href={href} className="relative z-[2] flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-tight text-ink">
          {car.title}
        </h3>
        <p className={`text-xl font-extrabold ${sold ? "text-muted line-through" : "text-senna"}`}>
          {formatBRL(car.price)}
        </p>
        {specs.length > 0 && <p className="text-sm text-muted">{specs.join(" · ")}</p>}
        {car.tags?.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {car.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-petroleo/50 px-2 py-0.5 text-[11px] font-medium text-rucula-bright"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </Link>
    </div>
  );
}
