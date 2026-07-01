import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";
import { sanitizeCarInput, ensureUniqueSlug, REVALIDATE_PATHS } from "@/lib/car-input";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const input = sanitizeCarInput(body as Record<string, unknown>);
  if (!input.title) return NextResponse.json({ error: "Informe o título do carro." }, { status: 400 });

  const supabase = createAdminClient();
  input.slug = await ensureUniqueSlug(supabase, input.slug, id);

  const { data, error } = await supabase
    .from("cars")
    .update(input)
    .eq("id", id)
    .select("id, slug")
    .single();
  if (error) {
    console.error("[PATCH /api/admin/cars]", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  for (const p of REVALIDATE_PATHS) revalidatePath(p);
  revalidatePath(`/carros/${data.slug}`);
  return NextResponse.json({ id: data.id, slug: data.slug });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  // Best-effort: remove as midias do Storage antes de apagar o registro.
  const { data: car } = await supabase.from("cars").select("photos, videos").eq("id", id).maybeSingle();
  const media = [
    ...((car?.photos as Array<{ path?: string }>) ?? []),
    ...((car?.videos as Array<{ path?: string }>) ?? []),
  ];
  const paths = media.map((m) => m?.path).filter((p): p is string => !!p);
  if (paths.length) await supabase.storage.from("car-media").remove(paths);

  const { error } = await supabase.from("cars").delete().eq("id", id);
  if (error) {
    console.error("[DELETE /api/admin/cars]", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  for (const p of REVALIDATE_PATHS) revalidatePath(p);
  return NextResponse.json({ ok: true });
}
