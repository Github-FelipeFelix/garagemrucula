import { createReadClient } from "@/lib/supabase/read";
import { isMissingSchema } from "@/lib/db-errors";
import type { Part } from "@/lib/types";

type QueryResult<T> = { data: T | null; error: { message: string; code?: string } | null };

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

// Degrada para [] só se a tabela 'parts' ainda não existir. Falha de serviço
// estoura: o ISR mantém a última vitrine boa no ar (ver lib/db-errors).
export async function getParts(options: GetPartsOptions = {}): Promise<Part[]> {
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
    if (isMissingSchema(error)) return [];
    throw new Error(`[getParts] ${error.message}`);
  }
  return sortForDisplay((data ?? []).map(normalize));
}

export async function getFeaturedParts(limit = 6): Promise<Part[]> {
  const parts = await getParts({ featured: true, limit });
  if (parts.length > 0) return parts;
  const recent = await getParts({ limit });
  return recent.filter((p) => p.status !== "vendido").slice(0, limit);
}

// null = peça não existe (vira 404). Falha de serviço estoura (ver getCarBySlug).
export async function getPartBySlug(slug: string): Promise<Part | null> {
  const supabase = createReadClient();
  const { data, error } = await withRetry<Record<string, unknown>>(() =>
    supabase.from("parts").select("*").eq("slug", slug).maybeSingle(),
  );
  if (error) {
    console.error("[getPartBySlug]", error.message);
    if (isMissingSchema(error)) return null;
    throw new Error(`[getPartBySlug] ${error.message}`);
  }
  return data ? normalize(data) : null;
}
