import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Media = { path: string; url: string };
const BUCKET = "car-media";

// Duplicar um carro precisa COPIAR os arquivos no Storage (cada carro dono das
// suas mídias). Antes, a cópia referenciava os MESMOS paths do original — e o
// apagar (que remove os objetos do bucket) matava as fotos do sobrevivente.
// Se uma cópia falhar, mantém a referência original (melhor compartilhar do que
// perder a foto; o removeMediaSafely abaixo protege esse caso no delete).
export async function copyMediaToNewPaths(
  supabase: SupabaseClient,
  media: Media[],
): Promise<Media[]> {
  const out: Media[] = [];
  for (const m of media) {
    try {
      const ext = (m.path.split(".").pop() || "jpg").toLowerCase();
      const dest = `cars/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).copy(m.path, dest);
      if (error) throw new Error(error.message);
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(dest);
      out.push({ path: dest, url: pub.publicUrl });
    } catch (e) {
      console.error("[storage copy]", m.path, e);
      out.push(m);
    }
  }
  return out;
}

// Remove do Storage APENAS os paths que nenhum OUTRO carro referencia.
// Protege as mídias compartilhadas por duplicatas feitas antes do fix acima.
// Best-effort: falha aqui nunca quebra a operação principal (fica lixo no
// bucket, que é barato; foto sumindo do site é que não pode).
export async function removeMediaSafely(
  supabase: SupabaseClient,
  paths: string[],
  excludeCarId?: string,
): Promise<void> {
  const candidates = paths.filter(Boolean);
  if (candidates.length === 0) return;
  try {
    let query = supabase.from("cars").select("id, photos, videos");
    if (excludeCarId) query = query.neq("id", excludeCarId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const inUse = new Set<string>();
    for (const row of data ?? []) {
      const media = [
        ...((row.photos as Array<{ path?: string }>) ?? []),
        ...((row.videos as Array<{ path?: string }>) ?? []),
      ];
      for (const m of media) if (m?.path) inUse.add(m.path);
    }

    const orphans = candidates.filter((p) => !inUse.has(p));
    if (orphans.length) {
      const { error: remErr } = await supabase.storage.from(BUCKET).remove(orphans);
      if (remErr) throw new Error(remErr.message);
    }
  } catch (e) {
    console.error("[storage cleanup]", e);
  }
}
