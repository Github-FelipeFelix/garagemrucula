import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Gauge, Cog, Settings2, Palette, Fuel, Factory, Car, type LucideIcon } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { getCarBySlug, getCars } from "@/lib/queries";
import { CarCard } from "@/components/CarCard";
import { CarGallery } from "@/components/CarGallery";
import { InteresseButton } from "@/components/InteresseButton";
import { ShareButton } from "@/components/ShareButton";
import { ViewTracker } from "@/components/ViewTracker";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBRL, formatKm } from "@/lib/format";
import { INSTAGRAM_URL, siteUrl } from "@/lib/site";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) return { title: "Carro não encontrado" };
  const cover = car.photos?.[0]?.url;
  const desc =
    car.description?.slice(0, 160) ||
    [car.year, car.km != null ? formatKm(car.km) : null, formatBRL(car.price)]
      .filter(Boolean)
      .join(" · ");
  return {
    title: car.title,
    description: desc,
    openGraph: {
      title: car.title,
      description: desc,
      images: cover ? [cover] : ["/og.jpg"],
      url: `${siteUrl()}/carros/${car.slug}`,
    },
  };
}

export default async function CarPage({ params }: Params) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) notFound();

  const related = (await getCars())
    .filter((c) => c.id !== car.id && c.status !== "vendido")
    .slice(0, 3);

  type Spec = { icon: LucideIcon; label: string; value: string | number | null | undefined };
  const specsRaw: Spec[] = [
    { icon: Calendar, label: "Ano", value: car.year },
    { icon: Gauge, label: "KM", value: car.km != null ? formatKm(car.km) : null },
    { icon: Cog, label: "Motor", value: car.engine },
    { icon: Settings2, label: "Câmbio", value: car.transmission },
    { icon: Palette, label: "Cor", value: car.color },
    { icon: Fuel, label: "Combustível", value: car.fuel },
    { icon: Factory, label: "Marca", value: car.brand },
    { icon: Car, label: "Modelo", value: car.model },
  ];
  const specs = specsRaw.filter(
    (s): s is Spec & { value: string | number } => s.value != null && s.value !== "",
  );
  const sold = car.status === "vendido";
  const url = `${siteUrl()}/carros/${car.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: car.title,
    ...(car.photos?.[0]?.url ? { image: [car.photos[0].url] } : {}),
    ...(car.description ? { description: car.description } : {}),
    ...(car.brand ? { brand: { "@type": "Brand", name: car.brand } } : {}),
    ...(car.price != null
      ? {
          offers: {
            "@type": "Offer",
            price: car.price,
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
        <ViewTracker carId={car.id} />
      <Link
        href="/carros"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition hover:text-ink"
      >
        <ArrowLeft size={16} /> voltar
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <CarGallery photos={car.photos} videos={car.videos} title={car.title} />

        <div className="flex flex-col gap-5">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={car.status} />
              {car.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-petroleo/50 px-2.5 py-1 text-xs font-medium text-rucula-bright"
                >
                  {t}
                </span>
              ))}
            </div>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{car.title}</h1>
            <p className={`mt-2 text-3xl font-extrabold ${sold ? "text-muted line-through" : "text-senna"}`}>
              {formatBRL(car.price)}
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
              <InteresseButton car={car} />
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline w-full"
                >
                  <InstagramIcon className="h-5 w-5" /> Instagram
                </a>
                <ShareButton title={car.title} url={url} />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-surface p-4 text-center">
              <p className="text-muted">Este carro já foi vendido. 🏁</p>
              <Link href="/carros" className="btn btn-primary mx-auto mt-3">
                Ver carros disponíveis
              </Link>
            </div>
          )}

          {car.mods?.length > 0 && (
            <div>
              <h2 className="section-title mb-3 text-xl">Modificações & acessórios</h2>
              <ul className="flex flex-wrap gap-2">
                {car.mods.map((m) => (
                  <li
                    key={m}
                    className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {car.description && (
            <div>
              <h2 className="section-title mb-2 text-xl">Sobre o carro</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted">{car.description}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div data-reveal>
            <p className="eyebrow mb-3">Veja também</p>
            <h2 className="section-title mb-6">Outros carros</h2>
          </div>
          <div data-reveal-stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
        </section>
      )}
      </div>
    </>
  );
}
