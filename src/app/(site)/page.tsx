import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getFeaturedCars, getCars } from "@/lib/queries";
import { getParts } from "@/lib/parts-queries";
import { getSiteSettings } from "@/lib/settings";
import { CarCard } from "@/components/CarCard";
import { PartCard } from "@/components/PartCard";
import { WhatsAppIcon } from "@/components/icons";
import { InstallApp } from "@/components/InstallApp";
import { whatsappLink } from "@/lib/format";

// ISR: revalida a cada 60s (o admin invalida na hora com revalidatePath ao salvar).
export const revalidate = 60;

export default async function HomePage() {
  const [featured, all, parts, settings] = await Promise.all([
    getFeaturedCars(6),
    getCars({ limit: 8 }),
    getParts({ limit: 6 }),
    getSiteSettings(),
  ]);
  const disponiveis = all.filter((c) => c.status !== "vendido");
  const hasCars = all.length > 0;
  const partsDisponiveis = parts.filter((p) => p.status !== "vendido");

  return (
    <>
      {/* HERO — marca (sem video, por decisao de produto), com orbs de glow */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="hero-grid" />
        <div
          className="orb orb-float-a -left-24 -top-32 h-[380px] w-[380px]"
          style={{ background: "radial-gradient(circle, #013c43 0%, transparent 70%)" }}
        />
        <div
          className="orb orb-float-b -right-24 top-10 h-[420px] w-[420px]"
          style={{ background: "radial-gradient(circle, rgba(36,165,75,0.35) 0%, transparent 70%)" }}
        />
        <div
          className="orb orb-float-c -bottom-32 left-1/2 h-[300px] w-[300px] -translate-x-1/2"
          style={{ background: "radial-gradient(circle, rgba(243,232,56,0.16) 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
          <Image
            src="/logo.png"
            alt="Garagem Rucula"
            width={420}
            height={306}
            className="fade-up h-auto w-52 drop-shadow-2xl sm:w-72"
            priority
          />
          <h1 className="fade-up fade-up-1 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
            Garagem <span className="text-rucula-bright text-glow-rucula">Rucula</span>
          </h1>
          <p className="fade-up fade-up-2 max-w-xl text-lg text-muted">{settings.heroSubtitulo}</p>
          <div className="fade-up fade-up-3 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/carros" className="btn btn-primary">
              Ver carros disponíveis
            </Link>
            <a
              href={whatsappLink("Olá! Vim pelo site da Garagem Rucula 🚗")}
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

      <div className="px-4 pt-8">
        <InstallApp />
      </div>

      {/* DESTAQUES */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div data-reveal>
            <p className="eyebrow mb-3">Seleção da casa</p>
            <h2 className="section-title mb-6">
              Em <span className="text-senna">destaque</span>
            </h2>
          </div>
          <div data-reveal-stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((car, i) => (
              <CarCard key={car.id} car={car} priority={i < 3} />
            ))}
          </div>
        </section>
      )}

      {/* À VENDA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div data-reveal className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Disponíveis agora</p>
            <h2 className="section-title">À venda</h2>
          </div>
          <Link
            href="/carros"
            className="inline-flex items-center gap-1 text-sm font-medium text-rucula-bright hover:underline"
          >
            ver todos <ArrowRight size={16} />
          </Link>
        </div>

        {disponiveis.length > 0 ? (
          <div data-reveal-stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {disponiveis.slice(0, 6).map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div data-reveal className="card px-6 py-14 text-center">
            <p className="font-display text-xl font-bold">
              {hasCars ? "Nenhum carro disponível no momento." : "Em breve, novos carros por aqui."}
            </p>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Chama a gente no WhatsApp ou acompanha o Instagram — chega novidade toda hora.
            </p>
            <a
              href={whatsappLink("Olá! Queria saber dos carros disponíveis na Garagem Rucula.")}
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

      {/* PEÇAS — chamada pra área de peças (some sozinha se não houver peças) */}
      {partsDisponiveis.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div data-reveal className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Do nosso estoque</p>
              <h2 className="section-title">
                Peças & <span className="text-senna">acessórios</span>
              </h2>
            </div>
            <Link
              href="/pecas"
              className="inline-flex items-center gap-1 text-sm font-medium text-rucula-bright hover:underline"
            >
              ver todas <ArrowRight size={16} />
            </Link>
          </div>
          <div data-reveal-stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partsDisponiveis.slice(0, 3).map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
