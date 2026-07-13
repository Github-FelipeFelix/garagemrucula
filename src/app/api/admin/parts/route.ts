import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";
import { sanitizePartInput, ensureUniquePartSlug, PART_REVALIDATE_PATHS } from "@/lib/part-input";

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const input = sanitizePartInput(body as Record<string, unknown>);
  if (!input.title) return NextResponse.json({ error: "Informe o nome da peça." }, { status: 400 });

  const supabase = createAdminClient();
  input.slug = await ensureUniquePartSlug(supabase, input.slug);

  const { data, error } = await supabase.from("parts").insert(input).select("id, slug").single();
  if (error) {
    console.error("[POST /api/admin/parts]", error.message);
    const friendly = /relation .* does not exist|"?parts"?/i.test(error.message)
      ? "A tabela de peças ainda não foi criada no banco. Rode a migração 0003_parts.sql."
      : error.message;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }

  for (const p of PART_REVALIDATE_PATHS) revalidatePath(p);
  return NextResponse.json({ id: data.id, slug: data.slug });
}
