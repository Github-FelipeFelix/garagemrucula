import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/format";

function toNum(v: unknown): number | null {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function toStr(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}
function toStrArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).trim()).filter(Boolean);
}
type Media = { path: string; url: string };
function toMedia(v: unknown): Media[] {
  if (!Array.isArray(v)) return [];
  const out: Media[] = [];
  for (const x of v) {
    if (x && typeof x === "object" && "path" in x && "url" in x) {
      const m = x as Media;
      out.push({ path: String(m.path), url: String(m.url) });
    }
  }
  return out;
}

const STATUSES = ["disponivel", "reservado", "vendido"] as const;

// Monta o objeto do carro a partir do body (coercao de tipos; nunca confiar no cliente).
export function sanitizeCarInput(body: Record<string, unknown>) {
  const title = String(body.title ?? "").trim();
  const rawSlug = String(body.slug ?? "").trim();
  const status = STATUSES.includes(body.status as (typeof STATUSES)[number])
    ? (body.status as string)
    : "disponivel";
  return {
    title,
    slug: slugify(rawSlug || title),
    brand: toStr(body.brand),
    model: toStr(body.model),
    year: toNum(body.year),
    price: toNum(body.price),
    km: toNum(body.km),
    engine: toStr(body.engine),
    transmission: toStr(body.transmission),
    color: toStr(body.color),
    fuel: toStr(body.fuel),
    description:
      body.description != null && String(body.description).trim() !== ""
        ? String(body.description)
        : null,
    mods: toStrArray(body.mods),
    tags: toStrArray(body.tags),
    photos: toMedia(body.photos),
    videos: toMedia(body.videos),
    status,
    featured: Boolean(body.featured),
  };
}

// Garante slug unico (append -2, -3... se colidir). Poucos carros -> loop barato.
export async function ensureUniqueSlug(
  supabase: SupabaseClient,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = base || "carro";
  let slug = root;
  for (let i = 2; i < 100; i++) {
    const { data } = await supabase.from("cars").select("id").eq("slug", slug).limit(1);
    const taken = !!data && data.length > 0 && data[0].id !== excludeId;
    if (!taken) return slug;
    slug = `${root}-${i}`;
  }
  return `${root}-x`;
}

// Dados de venda (privados) — usados quando status = vendido.
export function sanitizeSale(
  v: unknown,
): { sold_price: number | null; sold_at: string | null; notes: string | null } | null {
  if (!v || typeof v !== "object") return null;
  const s = v as Record<string, unknown>;
  const sold_price = toNum(s.sold_price);
  const sold_at = toStr(s.sold_at);
  const notes = toStr(s.notes);
  if (sold_price == null && !sold_at && !notes) return null;
  return { sold_price, sold_at, notes };
}

// Inclui o sitemap: carro novo entra no Google sem esperar a revalidação de 1h.
export const REVALIDATE_PATHS = ["/", "/carros", "/sitemap.xml"] as const;
