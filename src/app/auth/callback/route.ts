import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Callback do OAuth (Google): o Supabase redireciona pra cá com um "code";
// trocamos o code pela sessão (grava os cookies) e voltamos pro painel.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // "next" deve ser um caminho interno — evita open redirect pra domínio externo.
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Atrás do proxy da Vercel, o host real vem em x-forwarded-host.
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";
      const base = !isLocal && forwardedHost ? `https://${forwardedHost}` : origin;
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  // Falhou (code ausente/inválido ou e-mail não autorizado): volta pro login.
  return NextResponse.redirect(`${origin}/admin/login?erro=oauth`);
}
