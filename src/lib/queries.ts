import { createReadClient } from "@/lib/supabase/read";
import { isMissingSchema } from "@/lib/db-errors";
import type { Car } from "@/lib/types";

type QueryResult<T> = { data: T | null; error: { message: string; code?: string } | null };

// 1 nova tentativa em falha (rede/5xx/soluço do Supabase): um erro transitório
// não pode virar "Carro não encontrado"/vitrine vazia pro cliente. Erro lógico
// repetir 1x é inofensivo; erro transitório repetir 1x salva a página.
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

// Garante arrays/valores mesmo se colunas ainda nao existirem no banco (regra 3).
function normalize(row: Record<string, unknown>): Car {
  return {
    ...(row as unknown as Car),
    mods: (row.mods as string[]) ?? [],
    tags: (row.tags as string[]) ?? [],
    photos: (row.photos as Car["photos"]) ?? [],
    videos: (row.videos as Car["videos"]) ?? [],
    views: (row.views as number) ?? 0,
    status: (row.status as Car["status"]) ?? "disponivel",
    featured: Boolean(row.featured),
  };
}

// Ordena para exibicao: disponivel/reservado primeiro, vendido por ultimo; recentes primeiro.
const STATUS_WEIGHT: Record<Car["status"], number> = { disponivel: 0, reservado: 1, vendido: 2 };
function sortForDisplay(cars: Car[]): Car[] {
  return [...cars].sort((a, b) => {
    const w = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
    if (w !== 0) return w;
    return (b.created_at ?? "").localeCompare(a.created_at ?? "");
  });
}

type GetCarsOptions = { featured?: boolean; limit?: number };

// Degrada para [] só se a tabela ainda nao existir (regra 3). Falha de serviço
// estoura: o ISR mantém a última vitrine boa no ar (ver lib/db-errors).
export async function getCars(options: GetCarsOptions = {}): Promise<Car[]> {
  const supabase = createReadClient();
  // Factory: cada tentativa monta a query do zero (o builder não é re-executável).
  const { data, error } = await withRetry<Record<string, unknown>[]>(() => {
    let query = supabase.from("cars").select("*");
    if (options.featured) query = query.eq("featured", true);
    query = query.order("created_at", { ascending: false });
    if (options.limit) query = query.limit(options.limit);
    return query;
  });
  if (error) {
    console.error("[getCars]", error.message);
    if (isMissingSchema(error)) return [];
    throw new Error(`[getCars] ${error.message}`);
  }
  return sortForDisplay((data ?? []).map(normalize));
}

export async function getFeaturedCars(limit = 6): Promise<Car[]> {
  const cars = await getCars({ featured: true, limit });
  if (cars.length > 0) return cars;
  // Sem destaques marcados ainda: cai para os mais recentes disponiveis.
  const recent = await getCars({ limit });
  return recent.filter((c) => c.status !== "vendido").slice(0, limit);
}

// null = carro não existe (vira 404). Falha de serviço estoura, senão o anúncio
// viraria "não encontrado" no ar enquanto o banco está fora.
export async function getCarBySlug(slug: string): Promise<Car | null> {
  const supabase = createReadClient();
  const { data, error } = await withRetry<Record<string, unknown>>(() =>
    supabase.from("cars").select("*").eq("slug", slug).maybeSingle(),
  );
  if (error) {
    console.error("[getCarBySlug]", error.message);
    if (isMissingSchema(error)) return null;
    throw new Error(`[getCarBySlug] ${error.message}`);
  }
  return data ? normalize(data) : null;
}
