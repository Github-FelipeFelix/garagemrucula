import { createReadClient } from "@/lib/supabase/read";
import type { Car } from "@/lib/types";

type QueryResult<T> = { data: T | null; error: { message: string } | null };

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

// Todas as leituras degradam para [] se a tabela ainda nao existir (regra 3).
export async function getCars(options: GetCarsOptions = {}): Promise<Car[]> {
  try {
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
      return [];
    }
    return sortForDisplay((data ?? []).map(normalize));
  } catch (e) {
    console.error("[getCars] fatal", e);
    return [];
  }
}

export async function getFeaturedCars(limit = 6): Promise<Car[]> {
  const cars = await getCars({ featured: true, limit });
  if (cars.length > 0) return cars;
  // Sem destaques marcados ainda: cai para os mais recentes disponiveis.
  const recent = await getCars({ limit });
  return recent.filter((c) => c.status !== "vendido").slice(0, limit);
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  try {
    const supabase = createReadClient();
    const { data, error } = await withRetry<Record<string, unknown>>(() =>
      supabase.from("cars").select("*").eq("slug", slug).maybeSingle(),
    );
    if (error) {
      console.error("[getCarBySlug]", error.message);
      return null;
    }
    return data ? normalize(data) : null;
  } catch (e) {
    console.error("[getCarBySlug] fatal", e);
    return null;
  }
}
