import { NextResponse } from "next/server";

// Saúde do Supabase (Auth) vista pelo servidor: sem CORS e sem expor nada além de
// ok/fora. A tela de login usa pra avisar "o sistema está fora do ar" em vez de
// deixar o primo achar que errou a senha (out/2026: 402 por cota estourada).
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, status: 0 });
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch {
    return NextResponse.json({ ok: false, status: 0 });
  }
}
