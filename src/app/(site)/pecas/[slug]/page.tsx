import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, BadgeCheck, Factory, Car, type LucideIcon } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { getPartBySlug, getParts } from "@/lib/parts-queries";
import { PartCard } from "@/components/PartCard";
import { CarGallery } from "@/components/CarGallery";
import { InteressePecaButton } from "@/components/InteressePecaButton";
import { ShareButton } from "@/components/ShareButton";
import { ViewTracker } from "@/components/ViewTracker";
import { StatusBadge } from "@/components/StatusBadge";
import { PART_CONDITION_LABEL } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { INSTAGRAM_URL, siteUrl } from "@/lib/site";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const part = await getPartBySlug(slug);
  if (!part) return { title: "Peça não encontrada" };
  const desc =
    part.description?.slice(0, 160) ||
    [part.category, PART_CONDITION_LABEL[part.condition], formatBRL(part.price)]
      .filter(Boolean)
      .join(" · ");
  return {
    title: part.title,
    description: desc,
    openGraph: {
      title: part.title,
      description: desc,
      url: `${siteUrl()}/pecas/${part.slug}`,
    },
  };
}

export default async function PartPage({ params }: Params) {
  const { slug } = await params;
  const part = await getPartBySlug(slug);
  if (!part) notFound();

  const related = (await getParts())
    .filter((p) => p.id !== part.id && p.status !== "vendido")
    .slice(0, 3);

  type Spec = { icon: LucideIcon; label: string; value: string | number | null | undefined };
  const specsRaw: Spec[] = [
    { icon: Tag, label: "Categoria", value: part.category },
    { icon: BadgeCheck, label: "Estado", value: PART_CONDITION_LABEL[part.condition] },
    { icon: Factory, label: "Marca", value: part.brand },
    { icon: Car, label: "Serve em", value: part.compatibility },
  ];
  const specs = specsRaw.filter(
    (s): s is Spec & { value: string | number } => s.value != null && s.value !== "",
  );
  const sold = part.status === "vendido";
  const url = `${siteUrl()}/pecas/${part.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: part.title,
    ...(part.photos?.[0]?.url ? { image: [part.photos[0].url] } : {}),
    ...(part.description ? { description: part.description } : {}),
    ...(part.brand ? { brand: { "@type": "Brand", name: part.brand } } : {}),
    ...(part.price != null
      ? {
          offers: {
            "@type": "Offer",
            price: part.price,
            priceCurrency: "BRL",
            availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            url,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ViewTracker partId={part.id} />
        <Link
          href="/pecas"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition hover:text-ink"
        >
          <ArrowLeft size={16} /> voltar
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <CarGallery photos={part.photos} videos={part.videos} title={part.title} />

          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={part.status} />
                {part.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-petroleo/50 px-2.5 py-1 text-xs font-medium text-rucula-bright"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{part.title}</h1>
              <p className={`mt-2 text-3xl font-extrabold ${sold ? "text-muted line-through" : "text-senna"}`}>
                {formatBRL(part.price)}
              </p>
            </div>

            {specs.length > 0 && (
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5 bg-surface p-3">
                    <Icon size={18} className="shrink-0 text-rucula-bright" />
                    <div className="min-w-0">
                      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
                      <dd className="truncate font-medium text-ink">{String(value)}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}

            {!sold ? (
              <div className="flex flex-col gap-2">
                <InteressePecaButton part={part} />
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline w-full"
                  >
                    <InstagramIcon className="h-5 w-5" /> Instagram
                  </a>
                  <ShareButton title={part.title} url={url} />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-line bg-surface p-4 text-center">
                <p className="text-muted">Esta peça já foi vendida. 🏁</p>
                <Link href="/pecas" className="btn btn-primary mx-auto mt-3">
                  Ver peças disponíveis
                </Link>
              </div>
            )}

            {part.description && (
              <div>
                <h2 className="section-title mb-2 text-xl">Sobre a peça</h2>
                <p className="whitespace-pre-line leading-relaxed text-muted">{part.description}</p>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <div data-reveal>
              <p className="eyebrow mb-3">Veja também</p>
              <h2 className="section-title mb-6">Outras peças</h2>
            </div>
            <div data-reveal-stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PartCard key={p.id} part={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
