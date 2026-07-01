import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";
import { sanitizeCarInput, ensureUniqueSlug, REVALIDATE_PATHS } from "@/lib/car-input";

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const input = sanitizeCarInput(body as Record<string, unknown>);
  if (!input.title) return NextResponse.json({ error: "Informe o título do carro." }, { status: 400 });

  const supabase = createAdminClient();
  input.slug = await ensureUniqueSlug(supabase, input.slug);

  const { data, error } = await supabase.from("cars").insert(input).select("id, slug").single();
  if (error) {
    console.error("[POST /api/admin/cars]", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  for (const p of REVALIDATE_PATHS) revalidatePath(p);
  return NextResponse.json({ id: data.id, slug: data.slug });
}
