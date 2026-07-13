import Link from "next/link";
import Image from "next/image";
import { Plus, Eye, Pencil, Package } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Part } from "@/lib/types";
import { PART_CONDITION_LABEL } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

async function getParts(): Promise<Part[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("parts").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("[admin/parts]", error.message);
      return [];
    }
    return (data ?? []) as Part[];
  } catch (e) {
    console.error("[admin/parts] fatal", e);
    return [];
  }
}

export default async function AdminPartsPage() {
  const parts = await getParts();
  const disponiveis = parts.filter((p) => p.status === "disponivel").length;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Peças</h1>
        <Link href="/admin/pecas/nova" className="btn btn-primary">
          <Plus size={18} /> Nova peça
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Peças" value={parts.length} />
        <Stat label="Disponíveis" value={disponiveis} />
        <Stat label="Visualizações" value={parts.reduce((s, p) => s + (p.views || 0), 0)} />
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {parts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center text-muted">
            <Package className="mx-auto mb-3 text-muted" size={28} />
            Nenhuma peça cadastrada ainda. Clique em “Nova peça” para começar.
          </div>
        ) : (
          parts.map((part) => (
            <Link
              key={part.id}
              href={`/admin/pecas/${part.id}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-rucula/50 sm:gap-4"
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                {part.photos?.[0]?.url ? (
                  <Image src={part.photos[0].url} alt="" fill sizes="120px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs text-muted">—</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{part.title}</p>
                <p className="truncate text-xs text-muted">
                  {[part.category, PART_CONDITION_LABEL[part.condition]].filter(Boolean).join(" · ")}
                </p>
                <p className="text-sm text-senna">{formatBRL(part.price)}</p>
              </div>
              <div className="hidden items-center gap-1 text-sm text-muted sm:flex">
                <Eye size={15} /> {part.views || 0}
              </div>
              <StatusBadge status={part.status} />
              <Pencil size={16} className="shrink-0 text-muted" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
