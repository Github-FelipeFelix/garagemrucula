import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Storage das PEÇAS — deliberadamente separado de lib/storage-media.ts (carros)
// pra não tocar naquele arquivo crítico já corrigido. Mesmo bucket público
// 'car-media', mas paths com prefixo 'parts/'; o cleanup consulta a tabela 'parts'.
export type Media = { path: string; url: string };
const BUCKET = "car-media";

// Duplicar uma peça COPIA os arquivos no Storage (cada peça dona das suas mídias) —
// senão apagar a original OU a cópia mataria as fotos da outra. Se a cópia falhar,
// mantém a referência original (o removePartMediaSafely protege esse caso no delete).
export async function copyPartMediaToNewPaths(
  supabase: SupabaseClient,
  media: Media[],
): Promise<Media[]> {
  const out: Media[] = [];
  for (const m of media) {
    try {
      const ext = (m.path.split(".").pop() || "jpg").toLowerCase();
      const dest = `parts/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).copy(m.path, dest);
      if (error) throw new Error(error.message);
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(dest);
      out.push({ path: dest, url: pub.publicUrl });
    } catch (e) {
      console.error("[parts storage copy]", m.path, e);
      out.push(m);
    }
  }
  return out;
}

// Remove do Storage APENAS os paths que nenhuma OUTRA peça referencia.
// Best-effort: falhar aqui nunca quebra a operação (lixo no bucket é barato;
// foto sumindo do site é que não pode).
export async function removePartMediaSafely(
  supabase: SupabaseClient,
  paths: string[],
  excludePartId?: string,
): Promise<void> {
  const candidates = paths.filter(Boolean);
  if (candidates.length === 0) return;
  try {
    let query = supabase.from("parts").select("id, photos, videos");
    if (excludePartId) query = query.neq("id", excludePartId);
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
    console.error("[parts storage cleanup]", e);
  }
}
