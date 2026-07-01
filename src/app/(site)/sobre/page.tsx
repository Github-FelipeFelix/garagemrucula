import type { Metadata } from "next";
import Image from "next/image";
import { Award, Wrench } from "lucide-react";
import { WhatsAppIcon, InstagramIcon } from "@/components/icons";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/site";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sobre",
  description: "A história da Garagem Rúcula — do fusca verde rúcula ao nome que virou marca.",
};

const DIFERENCIAIS = [
  { icon: Award, title: "Seleção a dedo", text: "Cada carro é escolhido e preparado com capricho — nada de qualquer coisa." },
  { icon: Wrench, title: "Antigos e modificados", text: "Fuscas, kombis, importados e projetos turbo, rebaixado, rodas e som. O nicho é esse." },
  { icon: WhatsAppIcon, title: "Papo direto", text: "Curtiu um carro? Fala com a gente na hora, no WhatsApp ou no Instagram." },
];

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div data-reveal className="flex flex-col items-center text-center">
        <Image src="/logo.png" alt="Garagem Rúcula" width={220} height={160} className="h-auto w-40" />
        <p className="eyebrow mt-6">Nossa história</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
          A Garagem <span className="text-rucula-bright">Rúcula</span>
        </h1>
      </div>

      <div data-reveal className="mt-8 space-y-5 leading-relaxed text-muted">
        <p>
          Tudo começou com um Fusca <span className="text-ink">verde rúcula</span> — turbo, rodas de
          Porsche, feito no capricho. Foi esse carro que deu nome à garagem e mostrou o caminho:
          transformar clássicos em projetos que a galera para pra olhar.
        </p>
        <p>
          De lá pra cá, a Garagem Rúcula virou referência em <span className="text-ink">carros
          antigos, importados e modificados</span> — fuscas, kombis e projetos turbo e rebaixado, cada
          um com sua história. Uma pegada que carrega a paixão pelo automobilismo e a homenagem eterna
          ao <span className="text-ink">Senna</span>, presente na nossa marca.
        </p>
      </div>

      <div data-reveal-stagger className="mt-10 grid gap-4 sm:grid-cols-3">
        {DIFERENCIAIS.map((d) => (
          <div
            key={d.title}
            className="card relative p-5 transition-all duration-300 hover:-translate-y-1 hover:border-rucula/50"
          >
            <d.icon className="h-6 w-6 text-rucula-bright" />
            <h3 className="mt-3 font-display font-bold">{d.title}</h3>
            <p className="mt-1 text-sm text-muted">{d.text}</p>
          </div>
        ))}
      </div>

      <div data-reveal className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={whatsappLink("Olá! Vim pelo site da Garagem Rúcula 🚗")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-zap"
        >
          <WhatsAppIcon className="h-5 w-5" /> (19) 97416-5880
        </a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
          <InstagramIcon className="h-5 w-5" /> @{INSTAGRAM_HANDLE}
        </a>
      </div>
    </div>
  );
}
