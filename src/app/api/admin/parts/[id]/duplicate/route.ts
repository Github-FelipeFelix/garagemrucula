import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";
import { ensureUniquePartSlug, PART_REVALIDATE_PATHS } from "@/lib/part-input";
import { copyPartMediaToNewPaths } from "@/lib/parts-storage";
import type { Part } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// Duplica uma peça (cadastro rápido de peças parecidas). Copia os dados, gera novo
// slug, volta a "disponivel", zera destaque/views. Copia os ARQUIVOS no Storage.
export async function POST(_request: NextRequest, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("parts").select("*").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Peça não encontrada" }, { status: 404 });

  const part = data as Part;
  const slug = await ensureUniquePartSlug(supabase, `${part.slug}-copia`);
  const photos = await copyPartMediaToNewPaths(supabase, part.photos ?? []);
  const videos = await copyPartMediaToNewPaths(supabase, part.videos ?? []);
  const payload = {
    slug,
    title: `${part.title} (cópia)`,
    category: part.category,
    condition: part.condition,
    brand: part.brand,
    compatibility: part.compatibility,
    price: part.price,
    description: part.description,
    tags: part.tags,
    photos,
    videos,
    status: "disponivel",
    featured: false,
  };

  const { data: novo, error: insErr } = await supabase
    .from("parts")
    .insert(payload)
    .select("id")
    .single();
  if (insErr) {
    console.error("[duplicate part]", insErr.message);
    return NextResponse.json({ error: insErr.message }, { status: 400 });
  }

  for (const p of PART_REVALIDATE_PATHS) revalidatePath(p);
  return NextResponse.json({ id: novo.id });
}
