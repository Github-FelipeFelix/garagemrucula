import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Registra o interesse quando o visitante clica "tenho interesse" (vai pro WhatsApp + grava aqui).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const car_id = typeof body.car_id === "string" ? body.car_id : null;
    const car_title =
      typeof body.car_title === "string" ? body.car_title.slice(0, 200) : null;
    const source = body.source === "instagram" ? "instagram" : "whatsapp";

    const supabase = createAdminClient();
    const { error } = await supabase.from("leads").insert({ car_id, car_title, source });
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
