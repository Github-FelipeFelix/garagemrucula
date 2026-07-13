import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/format";

// Sanitização da peça (espelha car-input, porém autocontido — não toca no dos carros).
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
const CONDITIONS = ["novo", "seminovo", "usado"] as const;

// Monta o objeto da peça a partir do body (coerção de tipos; nunca confiar no cliente).
export function sanitizePartInput(body: Record<string, unknown>) {
  const title = String(body.title ?? "").trim();
  const rawSlug = String(body.slug ?? "").trim();
  const status = STATUSES.includes(body.status as (typeof STATUSES)[number])
    ? (body.status as string)
    : "disponivel";
  const condition = CONDITIONS.includes(body.condition as (typeof CONDITIONS)[number])
    ? (body.condition as string)
    : "usado";
  return {
    title,
    slug: slugify(rawSlug || title),
    category: toStr(body.category),
    condition,
    brand: toStr(body.brand),
    compatibility: toStr(body.compatibility),
    price: toNum(body.price),
    description:
      body.description != null && String(body.description).trim() !== ""
        ? String(body.description)
        : null,
    tags: toStrArray(body.tags),
    photos: toMedia(body.photos),
    videos: toMedia(body.videos),
    status,
    featured: Boolean(body.featured),
  };
}

// Garante slug único na tabela parts (append -2, -3… se colidir).
export async function ensureUniquePartSlug(
  supabase: SupabaseClient,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = base || "peca";
  let slug = root;
  for (let i = 2; i < 100; i++) {
    const { data } = await supabase.from("parts").select("id").eq("slug", slug).limit(1);
    const taken = !!data && data.length > 0 && data[0].id !== excludeId;
    if (!taken) return slug;
    slug = `${root}-${i}`;
  }
  return `${root}-x`;
}

// Revalida a home, a vitrine de peças e o sitemap (peça nova entra no Google na hora).
export const PART_REVALIDATE_PATHS = ["/", "/pecas", "/sitemap.xml"] as const;
