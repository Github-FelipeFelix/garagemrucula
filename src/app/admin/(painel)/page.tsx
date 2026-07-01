import Link from "next/link";
import Image from "next/image";
import { Plus, Eye, Pencil } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Car } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

async function getAllCars(): Promise<Car[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[admin/cars]", error.message);
      return [];
    }
    return (data ?? []) as Car[];
  } catch (e) {
    console.error("[admin/cars] fatal", e);
    return [];
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
  const cars = await getAllCars();
  const disponiveis = cars.filter((c) => c.status === "disponivel").length;
  const totalViews = cars.reduce((s, c) => s + (c.views || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Carros</h1>
        <Link href="/admin/carros/novo" className="btn btn-primary">
          <Plus size={18} /> Novo carro
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="Total" value={cars.length} />
        <Stat label="Disponíveis" value={disponiveis} />
        <Stat label="Visualizações" value={totalViews} />
      </div>

      <div className="mt-6 flex flex-col gap-2">
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
                  <Image src={car.photos[0].url} alt="" fill sizes="80px" className="object-cover" />
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
  );
}
