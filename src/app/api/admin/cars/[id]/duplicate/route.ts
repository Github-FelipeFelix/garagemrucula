import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";
import { ensureUniqueSlug, REVALIDATE_PATHS } from "@/lib/car-input";
import type { Car } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// Duplica um carro (cadastro rapido de carros parecidos). Copia os dados, gera
// novo slug, volta a "disponivel", zera destaque/views.
export async function POST(_request: NextRequest, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("cars").select("*").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Carro não encontrado" }, { status: 404 });

  const car = data as Car;
  const slug = await ensureUniqueSlug(supabase, `${car.slug}-copia`);
  const payload = {
    slug,
    title: `${car.title} (cópia)`,
    brand: car.brand,
    model: car.model,
    year: car.year,
    price: car.price,
    km: car.km,
    engine: car.engine,
    transmission: car.transmission,
    color: car.color,
    fuel: car.fuel,
    description: car.description,
    mods: car.mods,
    tags: car.tags,
    photos: car.photos,
    videos: car.videos,
    status: "disponivel",
    featured: false,
  };

  const { data: novo, error: insErr } = await supabase
    .from("cars")
    .insert(payload)
    .select("id")
    .single();
  if (insErr) {
    console.error("[duplicate]", insErr.message);
    return NextResponse.json({ error: insErr.message }, { status: 400 });
  }

  for (const p of REVALIDATE_PATHS) revalidatePath(p);
  return NextResponse.json({ id: novo.id });
}
