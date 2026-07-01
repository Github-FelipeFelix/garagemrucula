import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";

// Gera uma signed upload URL: o cliente sobe o arquivo DIRETO pro Storage (sem passar
// pelo servidor, evitando o limite de body da serverless). Protegido por admin.
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { ext?: unknown };
  const ext =
    typeof body.ext === "string" && /^[a-z0-9]{1,5}$/i.test(body.ext) ? body.ext.toLowerCase() : "jpg";
  const path = `cars/${crypto.randomUUID()}.${ext}`;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from("car-media").createSignedUploadUrl(path);
  if (error) {
    console.error("[upload-url]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const { data: pub } = supabase.storage.from("car-media").getPublicUrl(path);
  return NextResponse.json({ path: data.path, token: data.token, publicUrl: pub.publicUrl });
}
