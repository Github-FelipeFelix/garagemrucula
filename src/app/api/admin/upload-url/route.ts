import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";

// Gera uma signed upload URL: o cliente sobe o arquivo DIRETO pro Storage (sem passar
// pelo servidor, evitando o limite de body da serverless). Protegido por admin.
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { ext?: unknown; folder?: unknown };
  const ext =
    typeof body.ext === "string" && /^[a-z0-9]{1,5}$/i.test(body.ext) ? body.ext.toLowerCase() : "jpg";
  // Pasta dentro do MESMO bucket público (car-media). Allowlist: nunca confiar no
  // cliente pra montar o path. Default "cars" mantém o fluxo dos carros idêntico.
  const FOLDERS = ["cars", "parts", "espaco"];
  const folder = typeof body.folder === "string" && FOLDERS.includes(body.folder) ? body.folder : "cars";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from("car-media").createSignedUploadUrl(path);
  if (error) {
    console.error("[upload-url]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const { data: pub } = supabase.storage.from("car-media").getPublicUrl(path);
  return NextResponse.json({ path: data.path, token: data.token, publicUrl: pub.publicUrl });
}
