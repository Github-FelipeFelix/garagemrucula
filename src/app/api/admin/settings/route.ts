import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";
import { mergeSettings } from "@/lib/settings";

// Salva o conteúdo editável do site (Sobre, diferenciais, subtítulo do hero).
// Protegido por admin. mergeSettings coage/normaliza; aqui só limitamos tamanho.
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const merged = mergeSettings(body);
  const cap = (s: string, n: number) => s.slice(0, n);
  const clean = {
    heroSubtitulo: cap(merged.heroSubtitulo, 300),
    sobreP1: cap(merged.sobreP1, 2000),
    sobreP2: cap(merged.sobreP2, 2000),
    diferenciais: merged.diferenciais.map((d) => ({
      titulo: cap(d.titulo, 80),
      texto: cap(d.texto, 400),
    })),
  };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, data: clean, updated_at: new Date().toISOString() });
  if (error) {
    console.error("[/api/admin/settings]", error.message);
    // Mensagem amigável se a tabela ainda não foi criada.
    const friendly = /relation .* does not exist|site_settings/i.test(error.message)
      ? "A tabela de conteúdo ainda não foi criada no banco. Rode a migração 0002_site_settings.sql."
      : error.message;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }

  revalidatePath("/");
  revalidatePath("/sobre");
  return NextResponse.json({ ok: true });
}
