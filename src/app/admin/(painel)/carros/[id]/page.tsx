import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { CarForm } from "@/components/admin/CarForm";
import type { Car, CarSale } from "@/lib/types";

export const dynamic = "force-dynamic";

// 2 queries + join manual no TS (regra 1: sem embedded joins do PostgREST).
async function getCarAndSale(id: string): Promise<{ car: Car; sale: CarSale | null } | null> {
  try {
    const supabase = createAdminClient();
    const { data: car, error } = await supabase.from("cars").select("*").eq("id", id).maybeSingle();
    if (error || !car) return null;
    const { data: sale } = await supabase
      .from("car_sales")
      .select("*")
      .eq("car_id", id)
      .maybeSingle();
    return { car: car as Car, sale: (sale as CarSale) ?? null };
  } catch {
    return null;
  }
}

type Params = { params: Promise<{ id: string }> };

export default async function EditarCarroPage({ params }: Params) {
  const { id } = await params;
  const result = await getCarAndSale(id);
  if (!result) notFound();

  return (
    <div>
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} /> voltar
      </Link>
      <h1 className="mb-5 font-display text-2xl font-bold">Editar carro</h1>
      <CarForm car={result.car} sale={result.sale} />
    </div>
  );
}
