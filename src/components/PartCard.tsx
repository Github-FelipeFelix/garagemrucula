import Link from "next/link";
import type { Part } from "@/lib/types";
import { PART_CONDITION_LABEL } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { CarCardMedia } from "./CarCardMedia";

export function PartCard({ part, priority = false }: { part: Part; priority?: boolean }) {
  const photos = (part.photos ?? []).map((p) => p.url).filter(Boolean) as string[];
  const sold = part.status === "vendido";
  const href = `/pecas/${part.slug}`;
  const specs = [part.category, PART_CONDITION_LABEL[part.condition], part.brand].filter(Boolean) as string[];

  return (
    <div className="group card spotlight relative isolate flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-rucula/60 hover:shadow-[0_22px_44px_-24px_rgba(36,165,75,0.7)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <CarCardMedia photos={photos} alt={part.title} href={href} sold={sold} priority={priority} />

        <div className="pointer-events-none absolute left-3 top-3 z-30">
          <StatusBadge status={part.status} />
        </div>

        {part.featured && !sold && (
          <div className="pointer-events-none absolute right-3 top-3 z-30 inline-flex items-center rounded-full bg-senna px-2.5 py-1 text-xs font-semibold tracking-wide text-black">
            ★ destaque
          </div>
        )}

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
          {part.title}
        </h3>
        <p className={`text-xl font-extrabold ${sold ? "text-muted line-through" : "text-senna"}`}>
          {formatBRL(part.price)}
        </p>
        {specs.length > 0 && <p className="text-sm text-muted">{specs.join(" · ")}</p>}
        {part.compatibility && (
          <p className="line-clamp-1 text-xs text-muted">Serve em: {part.compatibility}</p>
        )}
      </Link>
    </div>
  );
}
