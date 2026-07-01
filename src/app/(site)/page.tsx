import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getFeaturedCars, getCars } from "@/lib/queries";
import { CarCard } from "@/components/CarCard";
import { WhatsAppIcon } from "@/components/icons";
import { whatsappLink } from "@/lib/format";

export default async function HomePage() {
  const [featured, all] = await Promise.all([getFeaturedCars(6), getCars({ limit: 8 })]);
  const disponiveis = all.filter((c) => c.status !== "vendido");
  const hasCars = all.length > 0;

  return (
    <>
      {/* HERO — marca (sem video, por decisao de produto) */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#013c4366,transparent_60%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-24">
          <Image
            src="/logo.png"
            alt="Garagem Rúcula"
            width={420}
            height={306}
            className="h-auto w-52 sm:w-72"
            priority
          />
          <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight sm:text-6xl">
            Garagem <span className="text-rucula-bright">Rúcula</span>
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Carros antigos, importados e modificados. Fuscas, kombis e projetos que contam história.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/carros" className="btn btn-primary">
              Ver carros disponíveis
            </Link>
            <a
              href={whatsappLink("Olá! Vim pelo site da Garagem Rúcula 🚗")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-zap"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="section-title mb-6">
            Em <span className="text-senna">destaque</span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((car, i) => (
              <CarCard key={car.id} car={car} priority={i < 3} />
            ))}
          </div>
        </section>
      )}

      {/* À VENDA */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="section-title">À venda</h2>
          <Link
            href="/carros"
            className="inline-flex items-center gap-1 text-sm font-medium text-rucula-bright hover:underline"
          >
            ver todos <ArrowRight size={16} />
          </Link>
        </div>

        {disponiveis.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {disponiveis.slice(0, 6).map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
            <p className="font-display text-xl font-bold">
              {hasCars ? "Nenhum carro disponível no momento." : "Em breve, novos carros por aqui."}
            </p>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Chama a gente no WhatsApp ou acompanha o Instagram — chega novidade toda hora.
            </p>
            <a
              href={whatsappLink("Olá! Queria saber dos carros disponíveis na Garagem Rúcula.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-zap mx-auto mt-6"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Falar no WhatsApp
            </a>
          </div>
        )}
      </section>
    </>
  );
}
