import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Registra o interesse quando o visitante clica "tenho interesse" (vai pro WhatsApp + grava aqui).
export async function POST(request: NextRequest) {
  try {
    // Proteção contra spam. O front dispara isto em paralelo ao abrir o WhatsApp
    // (fire-and-forget), então um 429 NUNCA impede o cliente de falar com a loja —
    // no máximo deixamos de registrar um lead de flood.
    const rl = rateLimit(`lead:${clientIp(request)}`, 30, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawId = typeof body.car_id === "string" ? body.car_id : "";
    const car_id = UUID_RE.test(rawId) ? rawId : null;
    const rawPartId = typeof body.part_id === "string" ? body.part_id : "";
    const part_id = UUID_RE.test(rawPartId) ? rawPartId : null;
    const car_title =
      typeof body.car_title === "string" ? body.car_title.trim().slice(0, 200) || null : null;
    const source = body.source === "instagram" ? "instagram" : "whatsapp";

    // Aditivo e seguro: só mando part_id quando é lead de PEÇA. Lead de carro
    // insere exatamente como antes (sem a coluna part_id) — funciona mesmo se a
    // migração 0003 ainda não tiver rodado.
    const row: Record<string, unknown> = { car_id, car_title, source };
    if (part_id) row.part_id = part_id;

    const supabase = createAdminClient();
    const { error } = await supabase.from("leads").insert(row);
    if (error) {
      console.error("[/api/lead]", error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/lead] fatal", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
