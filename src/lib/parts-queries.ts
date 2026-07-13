import { createReadClient } from "@/lib/supabase/read";
import type { Part } from "@/lib/types";

type QueryResult<T> = { data: T | null; error: { message: string } | null };

// 1 nova tentativa em falha transitória (mesma lógica de queries.ts): um soluço
// de rede não pode virar "peça não encontrada"/vitrine vazia pro cliente.
async function withRetry<T>(run: () => PromiseLike<QueryResult<T>>): Promise<QueryResult<T>> {
  const attempt = async (): Promise<QueryResult<T>> => {
    try {
      return await run();
    } catch (e) {
      return { data: null, error: { message: e instanceof Error ? e.message : String(e) } };
    }
  };
  let res = await attempt();
  if (res.error) {
    await new Promise((r) => setTimeout(r, 300));
    res = await attempt();
  }
  return res;
}

// Garante arrays/valores mesmo se a tabela ainda não existir (regra 3: degrada).
function normalize(row: Record<string, unknown>): Part {
  return {
    ...(row as unknown as Part),
    tags: (row.tags as string[]) ?? [],
    photos: (row.photos as Part["photos"]) ?? [],
    videos: (row.videos as Part["videos"]) ?? [],
    views: (row.views as number) ?? 0,
    status: (row.status as Part["status"]) ?? "disponivel",
    condition: (row.condition as Part["condition"]) ?? "usado",
    featured: Boolean(row.featured),
  };
}

// Disponível/reservado primeiro, vendido por último; recentes primeiro.
const STATUS_WEIGHT: Record<Part["status"], number> = { disponivel: 0, reservado: 1, vendido: 2 };
function sortForDisplay(parts: Part[]): Part[] {
  return [...parts].sort((a, b) => {
    const w = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
    if (w !== 0) return w;
    return (b.created_at ?? "").localeCompare(a.created_at ?? "");
  });
}

type GetPartsOptions = { featured?: boolean; limit?: number };

// Todas as leituras degradam para [] se a tabela 'parts' ainda não existir.
export async function getParts(options: GetPartsOptions = {}): Promise<Part[]> {
  try {
    const supabase = createReadClient();
    const { data, error } = await withRetry<Record<string, unknown>[]>(() => {
      let query = supabase.from("parts").select("*");
      if (options.featured) query = query.eq("featured", true);
      query = query.order("created_at", { ascending: false });
      if (options.limit) query = query.limit(options.limit);
      return query;
    });
    if (error) {
      console.error("[getParts]", error.message);
      return [];
    }
    return sortForDisplay((data ?? []).map(normalize));
  } catch (e) {
    console.error("[getParts] fatal", e);
    return [];
  }
}

export async function getFeaturedParts(limit = 6): Promise<Part[]> {
  const parts = await getParts({ featured: true, limit });
  if (parts.length > 0) return parts;
  const recent = await getParts({ limit });
  return recent.filter((p) => p.status !== "vendido").slice(0, limit);
}

export async function getPartBySlug(slug: string): Promise<Part | null> {
  try {
    const supabase = createReadClient();
    const { data, error } = await withRetry<Record<string, unknown>>(() =>
      supabase.from("parts").select("*").eq("slug", slug).maybeSingle(),
    );
    if (error) {
      console.error("[getPartBySlug]", error.message);
      return null;
    }
    return data ? normalize(data) : null;
  } catch (e) {
    console.error("[getPartBySlug] fatal", e);
    return null;
  }
}
