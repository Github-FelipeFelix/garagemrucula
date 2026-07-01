import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { CarForm } from "@/components/admin/CarForm";
import type { Car } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getCar(id: string): Promise<Car | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("cars").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return data as Car;
  } catch {
    return null;
  }
}

type Params = { params: Promise<{ id: string }> };

export default async function EditarCarroPage({ params }: Params) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) notFound();

  return (
    <div>
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} /> voltar
      </Link>
      <h1 className="mb-5 font-display text-2xl font-bold">Editar carro</h1>
      <CarForm car={car} />
    </div>
  );
}
