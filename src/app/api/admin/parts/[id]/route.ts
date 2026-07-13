import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";
import { sanitizePartInput, ensureUniquePartSlug, PART_REVALIDATE_PATHS } from "@/lib/part-input";
import { removePartMediaSafely, type Media } from "@/lib/parts-storage";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const input = sanitizePartInput(body as Record<string, unknown>);
  if (!input.title) return NextResponse.json({ error: "Informe o nome da peça." }, { status: 400 });

  const supabase = createAdminClient();
  input.slug = await ensureUniquePartSlug(supabase, input.slug, id);

  // Snapshot das mídias ANTES do update, pra limpar do Storage o que foi removido.
  const { data: before } = await supabase.from("parts").select("photos, videos").eq("id", id).maybeSingle();

  const { data, error } = await supabase
    .from("parts")
    .update(input)
    .eq("id", id)
    .select("id, slug")
    .single();
  if (error) {
    console.error("[PATCH /api/admin/parts]", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Limpa órfãos: mídias que saíram da peça na edição (e que nenhuma outra peça usa).
  if (before) {
    const oldMedia = [
      ...((before.photos as Media[]) ?? []),
      ...((before.videos as Media[]) ?? []),
    ];
    const kept = new Set([...input.photos, ...input.videos].map((m) => m.path));
    const removed = oldMedia.map((m) => m.path).filter((p) => p && !kept.has(p));
    await removePartMediaSafely(supabase, removed, id);
  }

  for (const p of PART_REVALIDATE_PATHS) revalidatePath(p);
  revalidatePath(`/pecas/${data.slug}`);
  return NextResponse.json({ id: data.id, slug: data.slug });
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  // Remove as mídias do Storage antes de apagar o registro — mas SÓ as que nenhuma
  // outra peça referencia (duplicatas antigas podem compartilhar; apagar uma não
  // pode matar as fotos da outra).
  const { data: part } = await supabase.from("parts").select("photos, videos").eq("id", id).maybeSingle();
  const media = [
    ...((part?.photos as Array<{ path?: string }>) ?? []),
    ...((part?.videos as Array<{ path?: string }>) ?? []),
  ];
  const paths = media.map((m) => m?.path).filter((p): p is string => !!p);
  await removePartMediaSafely(supabase, paths, id);

  const { error } = await supabase.from("parts").delete().eq("id", id);
  if (error) {
    console.error("[DELETE /api/admin/parts]", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  for (const p of PART_REVALIDATE_PATHS) revalidatePath(p);
  return NextResponse.json({ ok: true });
}
