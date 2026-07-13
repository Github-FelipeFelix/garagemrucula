import type { MetadataRoute } from "next";
import { getCars } from "@/lib/queries";
import { getParts } from "@/lib/parts-queries";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [cars, parts] = await Promise.all([getCars(), getParts()]);

  const carUrls: MetadataRoute.Sitemap = cars.map((c) => ({
    url: `${base}/carros/${c.slug}`,
    lastModified: c.updated_at || c.created_at || undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const partUrls: MetadataRoute.Sitemap = parts.map((p) => ({
    url: `${base}/pecas/${p.slug}`,
    lastModified: p.updated_at || p.created_at || undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/carros`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/pecas`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/sobre`, changeFrequency: "monthly", priority: 0.5 },
    ...carUrls,
    ...partUrls,
  ];
}
