import Link from "next/link";
import Image from "next/image";
import { Plus, Eye, Pencil, MessageSquare } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Car, Lead } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

async function getData(): Promise<{ cars: Car[]; leads: Lead[]; leadsCount: number }> {
  try {
    const supabase = createAdminClient();
    const [carsRes, leadsRes] = await Promise.all([
      supabase.from("cars").select("*").order("created_at", { ascending: false }),
      supabase
        .from("leads")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    if (carsRes.error) console.error("[admin/cars]", carsRes.error.message);
    return {
      cars: (carsRes.data ?? []) as Car[],
      leads: (leadsRes.data ?? []) as Lead[],
      leadsCount: leadsRes.count ?? 0,
    };
  } catch (e) {
    console.error("[admin dashboard] fatal", e);
    return { cars: [], leads: [], leadsCount: 0 };
  }
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  const { cars, leads, leadsCount } = await getData();
  const disponiveis = cars.filter((c) => c.status === "disponivel").length;
  const totalViews = cars.reduce((s, c) => s + (c.views || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Painel</h1>
        <Link href="/admin/carros/novo" className="btn btn-primary">
          <Plus size={18} /> Novo carro
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Carros" value={cars.length} />
        <Stat label="Disponíveis" value={disponiveis} />
        <Stat label="Visualizações" value={totalViews} />
        <Stat label="Interesses" value={leadsCount} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-bold">Carros</h2>
          <div className="flex flex-col gap-2">
            {cars.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center text-muted">
                Nenhum carro cadastrado ainda. Clique em “Novo carro” para começar.
              </div>
            ) : (
              cars.map((car) => (
                <Link
                  key={car.id}
                  href={`/admin/carros/${car.id}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-rucula/50 sm:gap-4"
                >
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                    {car.photos?.[0]?.url ? (
                      <Image src={car.photos[0].url} alt="" fill sizes="120px" className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-muted">—</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{car.title}</p>
                    <p className="text-sm text-senna">{formatBRL(car.price)}</p>
                  </div>
                  <div className="hidden items-center gap-1 text-sm text-muted sm:flex">
                    <Eye size={15} /> {car.views || 0}
                  </div>
                  <StatusBadge status={car.status} />
                  <Pencil size={16} className="shrink-0 text-muted" />
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
            <MessageSquare size={18} className="text-rucula-bright" /> Últimos interesses
          </h2>
          {leads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-surface p-6 text-center text-sm text-muted">
              Ninguém clicou em “tenho interesse” ainda.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {leads.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm"
                  >
                    <span className="truncate text-ink">{l.car_title || "(carro removido)"}</span>
                    <span className="shrink-0 text-xs text-muted">
                      {new Date(l.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/admin/leads"
                className="mt-2 inline-block text-sm text-rucula-bright hover:underline"
              >
                ver todos →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
